package com.workouttracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorkoutTrackerApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(WorkoutTrackerApplication.class, args);
        System.out.println("🚀 Workout Tracker Application Started!");
        System.out.println("🌐 Open browser: http://localhost:8080");
    }
}
