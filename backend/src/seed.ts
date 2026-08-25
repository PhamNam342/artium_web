import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './identity/user/entities/user.entity';

import * as bcrypt from 'bcrypt';
import { Artwork, ArtworkStatus } from './modules/artworks/artwork.entity';
import { Tag } from './modules/artworks/tag.entity';
import {
  SellerProfile,
  VerificationStatus,
} from './identity/seller_profile/entities/seller_profile.entity';

const artworkSeeds = [
  {
    title: 'Amber Horizon',
    description:
      'Warm amber layers inspired by the final light over a distant coastline.',
    price: '19760000.00',
    materials: 'acrylic on canvas',
    dimensions: { height: 70, width: 90, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    tags: ['painting', 'abstract'],
    artistEmail: 'amelia.artist@artium.com',
  },
  {
    title: 'Tidal Memory',
    description:
      'A fluid blue composition that recalls changing tides and quiet mornings.',
    price: '14040000.00',
    materials: 'oil on linen',
    dimensions: { height: 60, width: 60, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5',
    tags: ['painting', 'abstract'],
    artistEmail: 'minh.artist@artium.com',
  },
  {
    title: 'Garden After Rain',
    description:
      'A small botanical study of rain-washed leaves and soft afternoon light.',
    price: '10140000.00',
    materials: 'watercolor on paper',
    dimensions: { height: 42, width: 30, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062',
    tags: ['painting', 'landscape'],
    artistEmail: 'amelia.artist@artium.com',
  },
  {
    title: 'Stone Vessel No. 3',
    description:
      'Hand-built vessel with a matte charcoal surface and subtle carved marks.',
    price: '15860000.00',
    materials: 'stoneware ceramic',
    dimensions: { height: 32, width: 25, depth: 25, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
    tags: ['sculpture', 'ceramic'],
    artistEmail: 'noah.artist@artium.com',
  },
  {
    title: 'Red Thread',
    description:
      'A gestural work exploring movement, connection, and the energy of a single line.',
    price: '22880000.00',
    materials: 'mixed media on canvas',
    dimensions: { height: 100, width: 80, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
    tags: ['painting', 'abstract'],
    artistEmail: 'amelia.artist@artium.com',
  },
  {
    title: 'Fields of Blue',
    description:
      'A luminous landscape built from layered ultramarine and pale green washes.',
    price: '12220000.00',
    materials: 'gouache on paper',
    dimensions: { height: 50, width: 70, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4',
    tags: ['painting', 'landscape'],
    artistEmail: 'minh.artist@artium.com',
  },
  {
    title: 'Quiet Form',
    description:
      'A sculptural study in balance, texture, and a restrained ivory glaze.',
    price: '18720000.00',
    materials: 'porcelain',
    dimensions: { height: 38, width: 22, depth: 20, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1493106819501-66d381c466f1',
    tags: ['sculpture', 'ceramic'],
    artistEmail: 'noah.artist@artium.com',
  },
  {
    title: 'Violet Noon',
    description:
      'An abstracted urban scene where violet shadows meet a bright summer sky.',
    price: '27300000.00',
    materials: 'oil on canvas',
    dimensions: { height: 90, width: 120, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988f7',
    tags: ['painting', 'abstract'],
    artistEmail: 'amelia.artist@artium.com',
  },
  {
    title: 'Mangrove Study',
    description:
      'A detailed view of coastal roots and still water in late afternoon.',
    price: '16900000.00',
    materials: 'ink and watercolor',
    dimensions: { height: 56, width: 76, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
    tags: ['painting', 'landscape'],
    artistEmail: 'minh.artist@artium.com',
  },
  {
    title: 'Earth Bowl',
    description:
      'A low, wide bowl finished with natural iron-rich glaze and an unglazed foot.',
    price: '8320000.00',
    materials: 'ceramic',
    dimensions: { height: 12, width: 34, depth: 34, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
    tags: ['sculpture', 'ceramic'],
    artistEmail: 'noah.artist@artium.com',
  },
  {
    title: 'Night Bloom',
    description:
      'Deep indigo and crimson flowers emerge from a dark, textured ground.',
    price: '24180000.00',
    materials: 'acrylic on canvas',
    dimensions: { height: 80, width: 80, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    tags: ['painting', 'abstract'],
    artistEmail: 'amelia.artist@artium.com',
  },
  {
    title: 'Limestone Figure',
    description:
      'A compact carved form with softened edges and a tactile honed finish.',
    price: '30680000.00',
    materials: 'limestone',
    dimensions: { height: 45, width: 18, depth: 16, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642',
    tags: ['sculpture'],
    artistEmail: 'noah.artist@artium.com',
  },
  {
    title: 'Golden Monsoon',
    description:
      'A bright atmospheric landscape celebrating the gold and green of monsoon season.',
    price: '15080000.00',
    materials: 'oil pastel on paper',
    dimensions: { height: 45, width: 65, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
    tags: ['painting', 'landscape'],
    artistEmail: 'minh.artist@artium.com',
  },
  {
    title: 'Lotus at First Light',
    description:
      'A serene lotus pond in pale morning color, painted with delicate washes.',
    price: '13650000.00',
    materials: 'watercolor and ink on paper',
    dimensions: { height: 48, width: 64, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    tags: ['painting', 'landscape'],
    artistEmail: 'linh.artist@artium.com',
  },
  {
    title: 'Saigon Windows',
    description:
      'An intimate city study of light, shadow, and the geometry of old windows.',
    price: '17940000.00',
    materials: 'acrylic on canvas',
    dimensions: { height: 70, width: 50, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592',
    tags: ['painting', 'abstract'],
    artistEmail: 'linh.artist@artium.com',
  },
  {
    title: 'Woven Silence',
    description:
      'A handwoven textile wall piece composed of warm fibers and quiet rhythms.',
    price: '21100000.00',
    materials: 'hand-dyed cotton and silk',
    dimensions: { height: 110, width: 75, depth: 4, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1528459105426-b9548367069b',
    tags: ['textile', 'contemporary'],
    artistEmail: 'an.artist@artium.com',
  },
  {
    title: 'Indigo Current',
    description:
      'Layered indigo threads form an abstract current that shifts with the light.',
    price: '19500000.00',
    materials: 'woven linen and cotton',
    dimensions: { height: 95, width: 68, depth: 3, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6',
    tags: ['textile', 'abstract'],
    artistEmail: 'an.artist@artium.com',
  },
  {
    title: 'Concrete Poetry',
    description:
      'A minimal sculptural composition balancing cast concrete with brushed brass.',
    price: '28700000.00',
    materials: 'cast concrete and brass',
    dimensions: { height: 56, width: 38, depth: 24, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85',
    tags: ['sculpture', 'minimalist'],
    artistEmail: 'kai.artist@artium.com',
  },
  {
    title: 'Orbit Study',
    description:
      'A small brass and stone study of gravity, movement, and balanced tension.',
    price: '23400000.00',
    materials: 'brass and river stone',
    dimensions: { height: 35, width: 30, depth: 18, unit: 'cm' },
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c',
    tags: ['sculpture', 'minimalist'],
    artistEmail: 'kai.artist@artium.com',
  },
];

const artistSeeds = [
  {
    email: 'amelia.artist@artium.com',
    fullName: 'Amelia Stone',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85',
    isVerified: true,
    bio: 'Abstract painter exploring color, atmosphere, and quiet coastal light.',
    websiteUrl: 'https://artium.com/artists/amelia-stone',
  },
  {
    email: 'minh.artist@artium.com',
    fullName: 'Minh Nguyen',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=85',
    isVerified: true,
    bio: 'Vietnamese painter creating layered studies of landscape and memory.',
    websiteUrl: 'https://artium.com/artists/minh-nguyen',
  },
  {
    email: 'noah.artist@artium.com',
    fullName: 'Noah Rivera',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85',
    isVerified: true,
    bio: 'Sculptor working with clay, stone, and forms found in nature.',
    websiteUrl: 'https://artium.com/artists/noah-rivera',
  },
  {
    email: 'linh.artist@artium.com',
    fullName: 'Linh Tran',
    avatarUrl:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=85',
    isVerified: true,
    bio: 'Painter of luminous Vietnamese city scenes and botanical moments.',
    websiteUrl: 'https://artium.com/artists/linh-tran',
  },
  {
    email: 'an.artist@artium.com',
    fullName: 'An Pham',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=85',
    isVerified: true,
    bio: 'Textile artist weaving contemporary forms from hand-dyed fibers.',
    websiteUrl: 'https://artium.com/artists/an-pham',
  },
  {
    email: 'kai.artist@artium.com',
    fullName: 'Kai Le',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=85',
    isVerified: true,
    bio: 'Minimalist sculptor investigating balance, material, and movement.',
    websiteUrl: 'https://artium.com/artists/kai-le',
  },
  {
    email: 'hana.artist@artium.com',
    fullName: 'Hana Bui',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=85',
    isVerified: false,
    bio: 'Emerging illustrator documenting everyday rituals in bright colors.',
    websiteUrl: 'https://artium.com/artists/hana-bui',
  },
  {
    email: 'diego.artist@artium.com',
    fullName: 'Diego Morales',
    avatarUrl:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=400&q=85',
    isVerified: false,
    bio: 'A self-taught photographer looking for poetry in the ordinary.',
    websiteUrl: 'https://artium.com/artists/diego-morales',
  },
  {
    email: 'mai.artist@artium.com',
    fullName: 'Mai Phuong',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=85',
    isVerified: false,
    bio: 'Ceramic maker shaping playful objects for slow, everyday living.',
    websiteUrl: 'https://artium.com/artists/mai-phuong',
  },
  {
    email: 'theo.artist@artium.com',
    fullName: 'Theo Kim',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85',
    isVerified: false,
    bio: 'Digital artist experimenting with abstract landscapes and light.',
    websiteUrl: 'https://artium.com/artists/theo-kim',
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🌱 Bắt đầu chạy Seeder...');

  const dataSource = app.get(DataSource);

  try {
    await dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const sellerProfileRepository = manager.getRepository(SellerProfile);
      const artworkRepository = manager.getRepository(Artwork);
      const tagRepository = manager.getRepository(Tag);

      const adminEmail = 'admin@artium.com';
      let admin = await userRepository.findOneBy({ email: adminEmail });

      if (!admin) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        admin = userRepository.create({
          email: adminEmail,
          password: hashedPassword,
          full_name: 'Super Admin',
          role: UserRole.ADMIN,
        });
        admin = await userRepository.save(admin);
        console.log(`Đã tạo tài khoản Admin: ${adminEmail}`);
      } else if (admin.role !== UserRole.ADMIN) {
        admin.role = UserRole.ADMIN;
        admin = await userRepository.save(admin);
        console.log(`Đã cập nhật role ADMIN cho: ${adminEmail}`);
      } else {
        console.log('Tài khoản Admin đã tồn tại. Bỏ qua.');
      }

      const artistsByEmail = new Map<string, User>();
      for (const artistSeed of artistSeeds) {
        let artist = await userRepository.findOneBy({
          email: artistSeed.email,
        });

        if (!artist) {
          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash('Artist@123', salt);
          artist = userRepository.create({
            email: artistSeed.email,
            password: hashedPassword,
            full_name: artistSeed.fullName,
            avatar_url: artistSeed.avatarUrl,
            role: UserRole.ARTIST,
          });
          artist = await userRepository.save(artist);
          console.log(`Đã tạo artist: ${artistSeed.email}`);
        } else if (artist.role !== UserRole.ARTIST) {
          artist.role = UserRole.ARTIST;
          artist.full_name = artist.full_name || artistSeed.fullName;
          artist = await userRepository.save(artist);
        }

        if (!artist.avatar_url) {
          artist.avatar_url = artistSeed.avatarUrl;
          artist = await userRepository.save(artist);
        }

        artistsByEmail.set(artistSeed.email, artist);
      }

      let updatedProfileCount = 0;
      for (const artistSeed of artistSeeds) {
        const artist = artistsByEmail.get(artistSeed.email)!;
        let profile = await sellerProfileRepository.findOneBy({
          userId: artist.id,
        });
        let shouldSave = false;

        if (!profile) {
          profile = sellerProfileRepository.create({
            userId: artist.id,
            bio: artistSeed.bio,
            websiteUrl: artistSeed.websiteUrl,
            isVisible: true,
            isVerified: artistSeed.isVerified,
            verificationStatus: artistSeed.isVerified
              ? VerificationStatus.APPROVED
              : VerificationStatus.NONE,
          });
          shouldSave = true;
        } else {
          if (!profile.bio) {
            profile.bio = artistSeed.bio;
            shouldSave = true;
          }
          if (!profile.websiteUrl) {
            profile.websiteUrl = artistSeed.websiteUrl;
            shouldSave = true;
          }
          if (!profile.isVisible) {
            profile.isVisible = true;
            shouldSave = true;
          }
          const verificationStatus = artistSeed.isVerified
            ? VerificationStatus.APPROVED
            : VerificationStatus.NONE;
          if (
            profile.isVerified !== artistSeed.isVerified ||
            profile.verificationStatus !== verificationStatus
          ) {
            profile.isVerified = artistSeed.isVerified;
            profile.verificationStatus = verificationStatus;
            shouldSave = true;
          }
        }

        if (shouldSave) {
          await sellerProfileRepository.save(profile);
          updatedProfileCount += 1;
        }
      }
      console.log(`Đã tạo hoặc cập nhật ${updatedProfileCount} hồ sơ artist.`);

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
        .map((artwork) =>
          artworkRepository.create({
            sellerId: artistsByEmail.get(artwork.artistEmail)!.id,
            title: artwork.title,
            description: artwork.description,
            price: artwork.price,
            currency: 'VND',
            status: ArtworkStatus.ACTIVE,
            isPublished: true,
            images: [
              { url: artwork.image, alt: artwork.title, isPrimary: true },
            ],
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
      const artworkSeedsByTitle = new Map(
        artworkSeeds.map((artwork) => [artwork.title, artwork]),
      );
      const reassignedArtworks = existingArtworks.filter((artwork) => {
        if (!seededArtworkTitles.has(artwork.title)) return false;

        const seed = artworkSeedsByTitle.get(artwork.title)!;
        const artistId = artistsByEmail.get(seed.artistEmail)!.id;
        if (artwork.sellerId === artistId) return false;

        artwork.sellerId = artistId;
        return true;
      });

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
    });
  } catch (error) {
    console.error('Lỗi khi chạy Seeder:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
    console.log('🏁 Seeder hoàn tất.');
  }
}

void bootstrap();
