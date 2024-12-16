package com.hume.soil.exception;

import com.hume.soil.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleException(Exception e) {
        return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                .msg("操作失败: " + e.getMessage())
                .code("500")
                .build());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<String>> handleValidationException(ConstraintViolationException e) {
        return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                .msg("参数验证失败: " + e.getMessage())
                .code("400")
                .build());
    }
}
