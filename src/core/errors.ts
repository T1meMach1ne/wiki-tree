export class FileAccessError extends Error {
  constructor(
    message: string,
    public readonly filePath?: string
  ) {
    super(message);
    this.name = 'FileAccessError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export class IndexGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndexGenerationError';
  }
}

export class PortConflictError extends Error {
  constructor(
    message: string,
    public readonly port: number
  ) {
    super(message);
    this.name = 'PortConflictError';
  }
}

export class IndexLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndexLoadError';
  }
}
