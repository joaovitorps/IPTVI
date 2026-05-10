import { APICredentialRepository } from "@/core/domain/repositories/api/api-credential-repository";
import { ValidateCredentialsUseCase } from "@/core/domain/use-cases/validate-credentials";
import { ValidateParams } from "@/shared/types/ipc";

export const validateCredentials = async ({
  server,
  username,
  password,
}: ValidateParams) => {
  const validateCredentials = new ValidateCredentialsUseCase(
    new APICredentialRepository(),
  );

  const { isValid, error } = await validateCredentials.execute({
    server,
    username,
    password,
  });

  return {
    isValid,
    error,
  };
};
