import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { Gender, Prisma } from 'generated/prisma';
import { JwtService } from '@nestjs/jwt/dist';
import {User as PrismaUser} from 'generated/prisma'

export interface User {
  name : string,
  username : string,
  email : string,
  mobile : string,
  password : string,
  profilePicture? : string,
  gender : string
}

export interface Credentials {
  username? : string,
  email? : string,
  mobile? : string,
  password : string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService : JwtService
  ){}


  private async passwordBcrypt(password: string): Promise<string> {
    const saltrounds = 10;
    return await bcrypt.hash(password, saltrounds);
  }
  

  async createUser(props : User) {

    const handleGender = (gender : string) : Gender => {
      return gender === "male" ? Gender.MALE : Gender.FEMALE
    }

    try{
      const userRegistration = await this.prisma.user.create({
        data : {
          name : props.name,
          username : props.username,
          email : props.email,
          mobile : props.mobile,
          password : await this.passwordBcrypt(props.password),
          profilePicture : props.profilePicture || "",
          gender : handleGender(props.gender)
        }
      })
  
      if(userRegistration){
        return userRegistration
      }
    }catch(error) {
      console.log("user creation failrure", error)
    }
  }

  async getUser(
    id : string
  ) : Promise<PrismaUser> {
    try{
      const user = await this.prisma.user.findUnique(
        {
          where : {
            id : id
          }
        }
      )
      return user;
    }catch(error){
      console.log(error)
      throw error
    }
  }


  async validateUser(props : Credentials) : Promise<{access_token : string, user : PrismaUser}> {

    try{
      const user = await this.prisma.user.findFirst(
        {
          where : {
            OR : [
              {username : props.username},
              {email : props.email},
              {mobile : props.mobile},
            ]
          }
        }
      )

      
    if(user){
      const passwordMatch = await bcrypt.compare(props.password, user.password)

      if(passwordMatch) {
        const payload = { username: user.username, sub: user.id };
        return {
          access_token: this.jwtService.sign(payload),
          user : user
        };
      }

    }

    }catch(error){
      console.log(error)
    }
  }
}


