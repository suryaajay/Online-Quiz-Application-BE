package com.example.quiz.controller;

import com.example.quiz.entity.Attempt;
import com.example.quiz.entity.Question;
import com.example.quiz.entity.Quiz;
import com.example.quiz.repository.AttemptRepository;
import com.example.quiz.repository.QuestionRepository;
import com.example.quiz.repository.QuizRepository;
import com.example.quiz.repository.UserRepository;
import com.example.quiz.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AttemptRepository attemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> quizzes() {
        return ResponseEntity.ok(quizRepository.findAll());
    }

    /**
     * Submit quiz answers, persist attempt, and (optionally) send email notification.
     *
     * Note: For identification we accept X-User header (username). In production use JWT and extract user id.
     */
    
    // GET questions for a quiz (used by frontend when participant clicks "Take")
    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuestionsForQuiz(@PathVariable("quizId") Long quizId) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        return ResponseEntity.ok(questions);
    }


    @PostMapping("/quizzes/{id}/submit")
    public ResponseEntity<Map<String,Object>> submit(@PathVariable Long id,
                                                 @RequestBody Map<Long,String> answers,
                                                 @RequestHeader(value="X-User", required=false) String username) {
    List<Question> questions = questionRepository.findByQuizId(id);
    int score = 0;
    int total = 0;

    for (Question q : questions) {
        int marks = q.getMarks() == null ? 1 : q.getMarks();
        total += marks;
        String selected = answers.get(q.getId());
        if (selected != null && selected.equalsIgnoreCase(q.getCorrectOption())) {
            score += marks;
        }
    }

    // persist attempt
    Attempt attempt = new Attempt();
    if (username != null) {
        userRepository.findByUsername(username).ifPresent(u -> attempt.setUserId(u.getId()));
    }
    attempt.setQuizId(id);
    attempt.setScore(score);
    attempt.setTotal(total);
    try {
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        attempt.setAnswersJson(om.writeValueAsString(answers));
    } catch (Exception e) {
        attempt.setAnswersJson("{}");
    }
    attempt.setSubmittedAt(java.time.LocalDateTime.now());
    attemptRepository.save(attempt);

    // make final copies for use inside lambda
    final int finalScore = score;
    final int finalTotal = total;
    final Long savedAttemptId = attempt.getId();

    // send email notification if user exists and has email
    if (attempt.getUserId() != null) {
        userRepository.findById(attempt.getUserId()).ifPresent(u -> {
            try {
                String to = (u.getEmail() != null && !u.getEmail().isBlank()) ? u.getEmail() : u.getUsername();
                if (to != null && to.contains("@")) {
                    String subject = "Quiz result for quiz " + id;
                    String text = "You scored " + finalScore + " out of " + finalTotal + " for quiz: " + id
                                  + "\\nAttempt ID: " + savedAttemptId;
                    emailService.sendSimpleMail(to, subject, text);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
    }

    Map<String,Object> res = new HashMap<>();
    res.put("score", score);
    res.put("total", total);
    res.put("attemptId", attempt.getId());
    return ResponseEntity.ok(res);
    }
}
