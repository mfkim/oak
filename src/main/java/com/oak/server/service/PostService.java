package com.oak.server.service;

import com.oak.server.domain.Post;
import com.oak.server.domain.SiteUser;
import com.oak.server.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class PostService {

    private final PostRepository postRepository;

    // 1. 글 쓰기 (Create)
    @Transactional
    public void write(String title, String content, SiteUser author) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setCreateDate(LocalDateTime.now());
        post.setAuthor(author);
        this.postRepository.save(post);
    }

    // 2. 글 조회 (Read - Paging)
    @Transactional(readOnly = true)
    public Page<Post> getList(int page, String kw) {
        List<Sort.Order> sorts = new ArrayList<>();
        sorts.add(Sort.Order.desc("createDate"));
        Pageable pageable = PageRequest.of(page, 10, Sort.by(sorts));

        return this.postRepository.findAllByKeyword(kw, pageable);
    }

    // 2-1. 전체 글 조회 (API용)
    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    // 3. 특정 글 1개 조회 (Read Detail)
    @Transactional(readOnly = true)
    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 글입니다."));
    }

    // 4. 글 수정
    @Transactional
    public void modify(Post post, String title, String content, MultipartFile file, boolean isImageDeleted) throws IOException {
        post.setTitle(title);
        post.setContent(content);
        post.setModifyDate(LocalDateTime.now());

        // 새 파일이 들어온 경우 (교체)
        if (file != null && !file.isEmpty()) {
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static/files";
            UUID uuid = UUID.randomUUID();
            String fileName = uuid + "_" + file.getOriginalFilename();

            File saveFile = new File(projectPath, fileName);
            file.transferTo(saveFile);

            post.setFileName(fileName);
            post.setFilePath("/files/" + fileName);
        }
        // 새 파일은 없는데, 삭제하겠다고 한 경우 (삭제)
        else if (isImageDeleted) {
            post.setFileName(null);
            post.setFilePath(null);
        }

        this.postRepository.save(post);
    }

    // 5. 글 삭제 (Delete)
    @Transactional
    public void delete(Post post) {
        this.postRepository.delete(post);
    }

    // 6. 글 추천
    @Transactional
    public void vote(Post post, SiteUser siteUser) {
        if (post.getVoter().contains(siteUser)) {
            post.getVoter().remove(siteUser);
        } else {
            post.getVoter().add(siteUser);
        }
        this.postRepository.save(post);
    }

    // 7. 조회수 증가
    @Transactional
    public void increaseView(Post post) {
        post.setView(post.getView() + 1);
        this.postRepository.save(post);
    }

    // 8. 내가 쓴 글 조회
    @Transactional(readOnly = true)
    public List<Post> getMyPosts(SiteUser user) {
        return postRepository.findByAuthor(user);
    }

    // 9. 내가 좋아요 한 글 조회
    @Transactional(readOnly = true)
    public List<Post> getMyLikedPosts(SiteUser user) {
        return postRepository.findByVoterContains(user);
    }

    // 파일 업로드 포함 글쓰기
    @Transactional
    public void create(String title, String content, SiteUser user, MultipartFile file) throws IOException {
        Post p = new Post();
        p.setTitle(title);
        p.setContent(content);
        p.setCreateDate(LocalDateTime.now());
        p.setAuthor(user);

        if (file != null && !file.isEmpty()) {
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static/files";
            UUID uuid = UUID.randomUUID();
            String fileName = uuid + "_" + file.getOriginalFilename();

            File saveFile = new File(projectPath, fileName);
            file.transferTo(saveFile);

            p.setFileName(fileName);
            p.setFilePath("/files/" + fileName);
        }

        this.postRepository.save(p);
    }
}
