package com.hume.soil.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ApiResponse<T> {
    private String msg;
    private String code;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .msg("操作成功!")
                .code("200")
                .data(data)
                .build();
    }
}
