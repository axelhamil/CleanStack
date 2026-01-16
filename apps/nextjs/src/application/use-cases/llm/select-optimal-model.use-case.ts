import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  ISelectOptimalModelInputDto,
  ISelectOptimalModelOutputDto,
} from "@/application/dto/llm/select-optimal-model.dto";
import type { IModelRouter } from "@/application/ports/model-router.port";

export class SelectOptimalModelUseCase
  implements UseCase<ISelectOptimalModelInputDto, ISelectOptimalModelOutputDto>
{
  constructor(readonly _modelRouter: IModelRouter) {}

  async execute(
    _input: ISelectOptimalModelInputDto,
  ): Promise<Result<ISelectOptimalModelOutputDto>> {
    throw new Error("Not implemented");
  }
}
