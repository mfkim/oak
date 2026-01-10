package com.oak.server.service;

import com.oak.server.domain.SiteUser;
import com.oak.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SiteUser create(String username, String email, String password) {
        SiteUser user = new SiteUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        this.userRepository.save(user);
        return user;
    }

    // 유저ID로 회원 객체 조회
    public SiteUser getUser(String username) {
        Optional<SiteUser> siteUser = this.userRepository.findByUsername(username);
        if (siteUser.isPresent()) {
            return siteUser.get();
        } else {
            throw new RuntimeException("siteuser not found");
        }
    }

    // 프로필 사진
    @Transactional
    public SiteUser updateProfileImage(String username, MultipartFile file, boolean isImageDeleted) throws IOException {
        SiteUser user = this.getUser(username);

        // 1. 새 파일이 들어온 경우 (업로드)
        if (file != null && !file.isEmpty()) {
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static/files";
            UUID uuid = UUID.randomUUID();
            String fileName = uuid + "_profile_" + file.getOriginalFilename();

            File saveFile = new File(projectPath, fileName);
            file.transferTo(saveFile);

            user.setProfileImg("/files/" + fileName);
        }
        // 2. 삭제 요청이 들어온 경우 (초기화)
        else if (isImageDeleted) {
            user.setProfileImg(null); // DB에서 경로 삭제 (null로 설정)
        }

        return this.userRepository.save(user);
    }
}
