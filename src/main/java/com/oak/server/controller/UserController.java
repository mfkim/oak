package com.oak.server.controller;

import com.oak.server.domain.SiteUser;
import com.oak.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.ui.Model;

@RequiredArgsConstructor
@Controller
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    // 1. 회원가입 페이지 (GET)
    @GetMapping("/signup")
    public String signup(UserCreateForm userCreateForm) {
        return "signup_form";
    }

    // 2. 회원가입 처리 (POST)
    @PostMapping("/signup")
    public String signup(@Valid UserCreateForm userCreateForm, BindingResult bindingResult) {

        // ① 기본 유효성 검사
        if (bindingResult.hasErrors()) {
            return "signup_form";
        }

        // ② 비밀번호 확인 검사
        if (!userCreateForm.getPassword().equals(userCreateForm.getPassword2())) {
            bindingResult.rejectValue("password2", "passwordInCorrect", "비밀번호가 일치하지 않습니다.");
            return "signup_form";
        }

        // ③ 회원 저장 시도
        try {
            userService.create(userCreateForm.getUsername(),
                    userCreateForm.getEmail(),
                    userCreateForm.getPassword());
        } catch (DataIntegrityViolationException e) {
            e.printStackTrace();
            bindingResult.reject("signupFailed", "이미 등록된 사용자입니다.");
            return "signup_form";
        } catch (Exception e) {
            e.printStackTrace();
            bindingResult.reject("signupFailed", e.getMessage());
            return "signup_form";
        }

        return "redirect:/";
    }

    // 3. 로그인 페이지 (GET)
    @GetMapping("/login")
    public String login() {
        return "login_form";
    }

    // 4. 프로필
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public String profile(Model model, Principal principal) {
        SiteUser siteUser = this.userService.getUser(principal.getName());
        model.addAttribute("user", siteUser);
        return "user/profile";
    }
}
