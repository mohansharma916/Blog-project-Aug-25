import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/constants';
import slugify from 'slugify';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  private async makeUniqueSlug(title: string) {
    const base =
      slugify(title, { lower: true, strict: true, trim: true }) || 'post';
    let slug = base;
    let i = 0;

    // keep trying until no collision
    while (await this.prisma.post.findFirst({ where: { slug } })) {
      i += 1;
      slug = `${base}-${i}`;
    }
    return slug;
  }

  async findAll({
    skip = 0,
    take = DEFAULT_PAGE_SIZE,
  }: {
    skip?: number;
    take?: number;
  }) {
    return this.prisma.post.findMany({
      skip,
      take,
      include: {
        author: true,
        postTags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count() {
    return await this.prisma.post.count();
  }

  async findOne(id: string) {
    const data = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        postTags: { include: { tag: true } }, // tags are reachable via postTags.tag
        _count: { select: { comments: true, likes: true } },
      },
    });

    return data;
  }

  async findByUser({
    userId,
    skip = 0,
    take = DEFAULT_PAGE_SIZE,
  }: {
    userId: string;
    skip?: number;
    take?: number;
  }) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        published: true,
        slug: true,
        title: true,
        thumbnail: true,
        _count: { select: { comments: true, likes: true } },
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  async userPostCount(userId: string) {
    return this.prisma.post.count({ where: { authorId: userId } });
  }

  async create({
    createPostInput,
    authorId,
  }: {
    createPostInput: CreatePostInput & { tags?: string[] };
    authorId: string;
  }) {
    const { tags = [], ...rest } = createPostInput;

    console.log('service', createPostInput);
    const slug = await this.makeUniqueSlug(rest.title);
    return this.prisma.post.create({
      data: {
        ...rest,
        slug,
        author: { connect: { id: authorId } },
        // Because Post <-> Tag is via PostTag, we create PostTag rows and connect/create Tag.
        postTags: {
          create: tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
      include: {
        author: true,
        postTags: { include: { tag: true } },
      },
    });
  }

  async update({
    userId,
    updatePostInput,
  }: {
    userId: string;
    updatePostInput: UpdatePostInput & { tags?: string[]; postId: string };
  }) {
    const { postId, tags, ...data } = updatePostInput;

    // Ownership check using unique lookup on id only
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post || post.authorId !== userId) {
      throw new UnauthorizedException();
    }

    // If tags provided, we’ll reset PostTag rows and recreate them.
    if (Array.isArray(tags)) {
      await this.prisma.$transaction([
        this.prisma.postTag.deleteMany({ where: { postId } }),
        this.prisma.post.update({
          where: { id: postId },
          data: {
            ...data,
            postTags: {
              create: tags.map((name) => ({
                tag: {
                  connectOrCreate: {
                    where: { name },
                    create: { name },
                  },
                },
              })),
            },
          },
        }),
      ]);

      return this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: true,
          postTags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true } },
        },
      });
    }

    // No tag changes
    return this.prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: true,
        postTags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  async delete({ postId, userId }: { postId: string; userId: string }) {
    // Ownership check
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post || post.authorId !== userId) {
      throw new UnauthorizedException();
    }

    // Clean up join rows first (Mongo doesn’t enforce FKs; you added onDelete on some relations, but explicit cleanup is safest)
    await this.prisma.postTag.deleteMany({ where: { postId } });
    await this.prisma.like.deleteMany({ where: { postId } });
    await this.prisma.comment.deleteMany({ where: { postId } });

    const result = await this.prisma.post.delete({ where: { id: postId } });
    return !!result;
  }
}
