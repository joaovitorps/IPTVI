import { CredentialRepository } from "../repositories/credential-repository";

interface ValidateCredentialsUseCaseReturn {
  isValid: boolean;
  error?: string;
}

export class ValidateCredentialsUseCase {
  constructor(private readonly credentialsRepository: CredentialRepository) {}

  async execute(): Promise<ValidateCredentialsUseCaseReturn> {
    const response = await this.credentialsRepository.validate();

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
