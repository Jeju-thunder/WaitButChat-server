import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { member } from "@prisma/client";

export const GetMember = createParamDecorator(
    (data, ctx: ExecutionContext): member => {
        const req = ctx.switchToHttp().getRequest();

        return req.user;
    }
);