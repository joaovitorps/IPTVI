import { CredentialRepository } from "../repositories/credential-repository";

interface ValidateCredentialsUseCaseParams {
  server: string;
  username: string;
  password: string;
}
interface ValidateCredentialsUseCaseReturn {
  isValid: boolean;
  error?: string;
}

export class ValidateCredentialsUseCase {
  constructor(private readonly credentialsRepository: CredentialRepository) {}

  async execute({
    server,
    username,
    password,
  }: ValidateCredentialsUseCaseParams): Promise<ValidateCredentialsUseCaseReturn> {
    const response = await this.credentialsRepository.validate({
      server,
      username,
      password,
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: response.data.error,
      };
    }

    return {
      isValid: true,
    };
  }
}
