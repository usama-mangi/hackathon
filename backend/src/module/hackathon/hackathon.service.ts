import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Injectable()
export class HackathonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHackathonDto: CreateHackathonDto, authorId: string) {
    return this.prisma.hackathon.create({
      data: {
        name: createHackathonDto.name,
        description: createHackathonDto.description,
        startsAt: createHackathonDto.startsAt,
        endsAt: createHackathonDto.endsAt,
        isActive: createHackathonDto.isActive ?? true,
        authorId: authorId,
      },
    });
  }

  async findAll() {
    return this.prisma.hackathon.findMany();
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });
    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }
    return hackathon;
  }

  async update(id: string, updateHackathonDto: UpdateHackathonDto) {
    // Check if hackathon exists
    await this.findOne(id);

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        name: updateHackathonDto.name,
        description: updateHackathonDto.description,
        startsAt: updateHackathonDto.startsAt,
        endsAt: updateHackathonDto.endsAt,
        isActive: updateHackathonDto.isActive,
      },
    });
  }

  async remove(id: string) {
    // Check if hackathon exists
    await this.findOne(id);

    return this.prisma.hackathon.delete({
      where: { id },
    });
  }

  async join(hackathonId: string, userId: string) {
    const hackathon = await this.findOne(hackathonId);

    if (!hackathon.isActive) {
      throw new BadRequestException('This hackathon is no longer active');
    }

    try {
      await this.prisma.hackathonParticipant.create({
        data: {
          hackathonId,
          userId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already joined this hackathon');
      }
      throw error;
    }
  }
}
