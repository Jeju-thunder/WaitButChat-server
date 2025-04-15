import { Module } from "@nestjs/common";
import { MatchGateway } from "./match.gateway";
import PrismaModule from "src/providers/prisma/prisma.module";

@Module({
    providers: [MatchGateway],
    imports: [PrismaModule],
})
export class MatchModule { }