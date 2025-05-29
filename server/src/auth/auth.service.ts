import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface User {
  name : string,
  username : string,
  email : string,
  mobile : string,
  password : string,
  profilePicture? : string,
  gender : string
}

interface Credentials {
  username? : string,
  email? : string,
  mobile? : string,
  password : string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
  ){}

  async createUser(props : User) {
    try{
      const userRegistration = await this.prisma.user.create({
        data : {
          name : props.name,
          username : props.username,
          email : props.email,
          mobile : props.mobile,
          password : props.password,
          profilePicture : props.profilePicture,
          gender : props.gender
        }
      })
  
      if(userRegistration){
        return userRegistration
      }
    }catch(error) {
      console.log("user creation failrure", error)
    }
  }


  async validateUser(props : Credentials) : Promise<{status : string}> {

    try{
      const user = await this.prisma.user.findFirst(
        {
          where : {
            OR : {
              username : props.username,
              email : props.email,
              mobile : props.mobile
            }
          }
        }
      )

      
    if(user){
      if(user.password === props.password){
        return {status : "success"}
      }else{
        return {status : "fail"}
      }
    }

    }catch(error){
      console.log(error)
    }
  }
}


