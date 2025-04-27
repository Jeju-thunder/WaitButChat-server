import { Module } from "@nestjs/common";
import { MatchGateway } from "./match.gateway";
import ChatModule from "src/api/http/chat/chat.module";

@Module({
    providers: [MatchGateway],
    imports: [ChatModule],
})
export class MatchModule { }