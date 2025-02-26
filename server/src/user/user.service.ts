import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma} from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma : PrismaService){}

  async createUser(data : {
    name :string,
    email : string,
    username : string,
    password : string,
    phnum : string,
  }) : Promise <User>{
    const saltRounds = 10;
    const hashedpass = await bcrypt.hash(data.password, saltRounds);
    
    return this.prisma.user.create({
      data : {
        ...data,
        password : hashedpass,
      }
    });
  }


  async getUser(data : {
    id : string
  }) : Promise<User>{
    return this.prisma.user.findUnique(
      {
        where : {
          id : data.id
        }
      }
    )
  }

  async validateUser(
    data : Prisma.UserWhereUniqueInput
  ) : Promise<User> {
    return this.prisma.user.findFirst({
      where : data
    })
  }
}
