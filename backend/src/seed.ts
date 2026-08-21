import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './identity/user/entities/user.entity';

import * as bcrypt from 'bcrypt';
import { Artwork, ArtworkStatus } from './modules/artworks/artwork.entity';
import { Tag } from './modules/artworks/tag.entity';

const artworkSeeds = [
  {
    title: 'Amber Horizon',
    description:
      'Warm amber layers inspired by the final light over a distant coastline.',
    price: '760.00',
    materials: 'acrylic on canvas',
    dimensions: { height: 70, width: 90, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    tags: ['painting', 'abstract'],
  },
  {
    title: 'Tidal Memory',
    description:
      'A fluid blue composition that recalls changing tides and quiet mornings.',
    price: '540.00',
    materials: 'oil on linen',
    dimensions: { height: 60, width: 60, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5',
    tags: ['painting', 'abstract'],
  },
  {
    title: 'Garden After Rain',
    description:
      'A small botanical study of rain-washed leaves and soft afternoon light.',
    price: '390.00',
    materials: 'watercolor on paper',
    dimensions: { height: 42, width: 30, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062',
    tags: ['painting', 'landscape'],
  },
  {
    title: 'Stone Vessel No. 3',
    description:
      'Hand-built vessel with a matte charcoal surface and subtle carved marks.',
    price: '610.00',
    materials: 'stoneware ceramic',
    dimensions: { height: 32, width: 25, depth: 25, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
    tags: ['sculpture', 'ceramic'],
  },
  {
    title: 'Red Thread',
    description:
      'A gestural work exploring movement, connection, and the energy of a single line.',
    price: '880.00',
    materials: 'mixed media on canvas',
    dimensions: { height: 100, width: 80, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
    tags: ['painting', 'abstract'],
  },
  {
    title: 'Fields of Blue',
    description:
      'A luminous landscape built from layered ultramarine and pale green washes.',
    price: '470.00',
    materials: 'gouache on paper',
    dimensions: { height: 50, width: 70, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4',
    tags: ['painting', 'landscape'],
  },
  {
    title: 'Quiet Form',
    description:
      'A sculptural study in balance, texture, and a restrained ivory glaze.',
    price: '720.00',
    materials: 'porcelain',
    dimensions: { height: 38, width: 22, depth: 20, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1493106819501-66d381c466f1',
    tags: ['sculpture', 'ceramic'],
  },
  {
    title: 'Violet Noon',
    description:
      'An abstracted urban scene where violet shadows meet a bright summer sky.',
    price: '1050.00',
    materials: 'oil on canvas',
    dimensions: { height: 90, width: 120, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988f7',
    tags: ['painting', 'abstract'],
  },
  {
    title: 'Mangrove Study',
    description:
      'A detailed view of coastal roots and still water in late afternoon.',
    price: '650.00',
    materials: 'ink and watercolor',
    dimensions: { height: 56, width: 76, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
    tags: ['painting', 'landscape'],
  },
  {
    title: 'Earth Bowl',
    description:
      'A low, wide bowl finished with natural iron-rich glaze and an unglazed foot.',
    price: '320.00',
    materials: 'ceramic',
    dimensions: { height: 12, width: 34, depth: 34, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
    tags: ['sculpture', 'ceramic'],
  },
  {
    title: 'Night Bloom',
    description:
      'Deep indigo and crimson flowers emerge from a dark, textured ground.',
    price: '930.00',
    materials: 'acrylic on canvas',
    dimensions: { height: 80, width: 80, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    tags: ['painting', 'abstract'],
  },
  {
    title: 'Limestone Figure',
    description:
      'A compact carved form with softened edges and a tactile honed finish.',
    price: '1180.00',
    materials: 'limestone',
    dimensions: { height: 45, width: 18, depth: 16, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642',
    tags: ['sculpture'],
  },
  {
    title: 'Golden Monsoon',
    description:
      'A bright atmospheric landscape celebrating the gold and green of monsoon season.',
    price: '580.00',
    materials: 'oil pastel on paper',
    dimensions: { height: 45, width: 65, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
    tags: ['painting', 'landscape'],
  },
];

const artistSeeds = [
  { email: 'amelia.artist@artium.com', fullName: 'Amelia Stone' },
  { email: 'minh.artist@artium.com', fullName: 'Minh Nguyen' },
  { email: 'noah.artist@artium.com', fullName: 'Noah Rivera' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Bắt đầu chạy Seeder...');

  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);
  const artworkRepository = dataSource.getRepository(Artwork);
  const tagRepository = dataSource.getRepository(Tag);

  try {
    const adminEmail = 'admin@artium.com';
    let admin = await userRepository.findOneBy({ email: adminEmail });

    if (!admin) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        full_name: 'Super Admin',
      });
      admin = await userRepository.save(admin);
      console.log(`Đã tạo tài khoản Admin: ${adminEmail}`);
    } else {
      console.log('Tài khoản Admin đã tồn tại. Bỏ qua.');
    }

    const artists: User[] = [];
    for (const artistSeed of artistSeeds) {
      let artist = await userRepository.findOneBy({ email: artistSeed.email });

      if (!artist) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('Artist@123', salt);
        artist = userRepository.create({
          email: artistSeed.email,
          password: hashedPassword,
          full_name: artistSeed.fullName,
          role: UserRole.ARTIST,
        });
        artist = await userRepository.save(artist);
        console.log(`Đã tạo artist: ${artistSeed.email}`);
      } else if (artist.role !== UserRole.ARTIST) {
        artist.role = UserRole.ARTIST;
        artist.full_name = artist.full_name || artistSeed.fullName;
        artist = await userRepository.save(artist);
      }

      artists.push(artist);
    }

    const tagNames = [
      ...new Set(artworkSeeds.flatMap((artwork) => artwork.tags)),
    ];
    const tagsByName = new Map<string, Tag>();

    for (const name of tagNames) {
      const existingTag = await tagRepository.findOneBy({ name });
      const tag =
        existingTag ??
        (await tagRepository.save(tagRepository.create({ name })));
      tagsByName.set(name, tag);
    }

    const existingArtworks = await artworkRepository.find();
    const existingTitles = new Set(
      existingArtworks.map((artwork) => artwork.title),
    );
    const newArtworks = artworkSeeds
      .filter((artwork) => !existingTitles.has(artwork.title))
      .map((artwork, index) =>
        artworkRepository.create({
          sellerId: artists[index % artists.length].id,
          title: artwork.title,
          description: artwork.description,
          price: artwork.price,
          currency: 'USD',
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
          images: [{ url: artwork.image, alt: artwork.title, isPrimary: true }],
          viewCount: 0,
          materials: artwork.materials,
          dimensions: artwork.dimensions,
          tags: artwork.tags
            .map((name) => tagsByName.get(name)!)
            .filter(Boolean),
        }),
      );

    const seededArtworkTitles = new Set(
      artworkSeeds.map((artwork) => artwork.title),
    );
    const existingSeededArtworks = existingArtworks.filter((artwork) =>
      seededArtworkTitles.has(artwork.title),
    );
    const reassignedArtworks = existingSeededArtworks.filter(
      (artwork, index) => {
        const artistId = artists[index % artists.length].id;
        if (artwork.sellerId !== admin.id || artwork.sellerId === artistId) {
          return false;
        }
        artwork.sellerId = artistId;
        return true;
      },
    );

    if (newArtworks.length > 0 || reassignedArtworks.length > 0) {
      if (newArtworks.length > 0) await artworkRepository.save(newArtworks);
      if (reassignedArtworks.length > 0) {
        await artworkRepository.save(reassignedArtworks);
      }
      console.log(
        `Đã thêm ${newArtworks.length} tác phẩm mẫu và phân bổ ${reassignedArtworks.length} tác phẩm cho artist.`,
      );
    } else {
      console.log(' Dữ liệu tác phẩm mẫu đã tồn tại. Bỏ qua.');
    }
  } catch (error) {
    console.error('Lỗi khi chạy Seeder:', error);
  } finally {
    await app.close();
    console.log('🏁 Seeder hoàn tất.');
  }
}

void bootstrap();
