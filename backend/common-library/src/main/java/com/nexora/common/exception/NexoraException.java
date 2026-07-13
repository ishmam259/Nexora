package com.nexora.common.exception;

public class NexoraException extends RuntimeException {
    public NexoraException(String message) {
        super(message);
    }

    public NexoraException(String message, Throwable cause) {
        super(message, cause);
    }
}
