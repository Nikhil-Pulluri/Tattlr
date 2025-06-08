import { Module, forwardRef } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ConversationModule } from 'src/conversation/conversation.module';
@Module({
  imports : [forwardRef(() => ConversationModule)],
  controllers: [MessageController],
  providers: [MessageService],
  exports : [MessageService]
})
export class MessageModule {}
