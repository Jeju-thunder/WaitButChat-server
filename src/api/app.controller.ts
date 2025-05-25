import { Controller, Get } from "@nestjs/common";
import { SchedulerService } from "src/providers/scheduler/scheduler.service";

@Controller()
export class AppController {
    constructor(private readonly schedulerService: SchedulerService) { }
    @Get('update-question')
    async updateQuestion(): Promise<string> {
        await this.schedulerService.handleDailyCron();
        return 'OK  ';
    }
}