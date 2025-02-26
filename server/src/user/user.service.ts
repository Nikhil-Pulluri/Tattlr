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


  async getUser(data : { // just testing
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

  async validateUser(data: Prisma.UserWhereUniqueInput): Promise<User> {
    const conditions = [];
    if (data.email) conditions.push({ email: data.email });
    if (data.username) conditions.push({ username: data.username });
    if (data.phnum) conditions.push({ phnum: data.phnum });
  
    return this.prisma.user.findFirst({
      where: {
        OR: conditions.length ? conditions : undefined
      }
    });
  }
  
}
