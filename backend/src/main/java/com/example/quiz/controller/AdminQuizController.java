package com.example.quiz.controller;

import com.example.quiz.entity.Quiz;
import com.example.quiz.entity.Question;
import com.example.quiz.repository.QuizRepository;
import com.example.quiz.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/quizzes")
public class AdminQuizController {
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private QuestionRepository questionRepository;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz q) {
        return ResponseEntity.ok(quizRepository.save(q));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> list() {
        return ResponseEntity.ok(quizRepository.findAll());
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Question> addQuestion(@PathVariable Long quizId, @RequestBody Question question) {
        question.setQuizId(quizId);
        return ResponseEntity.ok(questionRepository.save(question));
    }
}
