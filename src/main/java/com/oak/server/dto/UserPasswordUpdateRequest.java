package com.oak.server.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPasswordUpdateRequest {
    private String oldPassword;
    private String newPassword;
    private String newPasswordCheck;
}
