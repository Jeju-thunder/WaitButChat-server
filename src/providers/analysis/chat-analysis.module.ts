import { Module } from "@nestjs/common";
import { ChatAnalysisService } from "./chat-analysis.service";

@Module({
    imports: [],
    controllers: [],
    providers: [ChatAnalysisService],
    exports: []
})
export class ChatAnalysisModule { }