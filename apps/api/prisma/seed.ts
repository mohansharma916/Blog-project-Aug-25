import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
import { ObjectId } from 'bson';

const prisma = new PrismaClient();

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/ /g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, ''); // Remove all non-word characters
}

async function main() {
  const defaultPassword = await hash('123');
  const users = Array.from({ length: 10 }).map(() => ({
    id: new ObjectId().toString(), // Pre-generate ObjectId for users
    name: faker.person.fullName(),
    email: faker.internet.email(),
    bio: faker.lorem.sentence(),
    avatar: faker.image.avatar(),
    password: defaultPassword,
  }));

  await prisma.user.createMany({
    data: users,
  });

  const userIds = users.map((user) => user.id); // Collect user IDs

  const posts = Array.from({ length: 400 }).map(() => ({
    title: faker.lorem.sentence(),
    slug: generateSlug(faker.lorem.sentence()),
    content: faker.lorem.paragraphs(3),
    thumbnail: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
    authorId: faker.helpers.arrayElement(userIds), // Use valid user ID
    published: true,
  }));

  await Promise.all(
    posts.map(
      async (post) =>
        await prisma.post.create({
          data: {
            ...post,
            comments: {
              createMany: {
                data: Array.from({ length: 20 }).map(() => ({
                  content: faker.lorem.sentence(),
                  authorId: faker.helpers.arrayElement(userIds), // Use valid user ID
                })),
              },
            },
          },
        }),
    ),
  );

  console.log('Seeding Completed!');
}

main()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    prisma.$disconnect();
    console.error(e);
    process.exit(1);
  });
