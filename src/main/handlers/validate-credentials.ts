import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { APICredentialRepository } from "@/core/domain/repositories/api/api-credential-repository";
import { ValidateCredentialsUseCase } from "@/core/domain/use-cases/validate-credentials";

export const validateCredentials = async (credentials: Credentials) => {
  const validateCredentials = new ValidateCredentialsUseCase(
    new APICredentialRepository(credentials),
  );

  const { isValid, error } = await validateCredentials.execute();

  return {
    isValid,
    error,
  };
};
