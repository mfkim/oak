package com.oak.server.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostModifyRequest {
    private String title;
    private String content;
}
