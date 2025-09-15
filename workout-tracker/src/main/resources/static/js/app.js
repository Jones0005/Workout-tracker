        class WorkoutTracker {
            constructor() {
                this.currentView = 'split';
                this.selectedDay = '';
                this.workouts = {};
                this.selectedWorkout = '';
                this.chart = null;

                this.weeklySchedule = {
                    Monday: { muscle: 'Chest & Triceps', color: 'chest-day' },
                    Tuesday: { muscle: 'Back & Biceps', color: 'back-day' },
                    Wednesday: { muscle: 'Legs', color: 'legs-day' },
                    Thursday: { muscle: 'Shoulders', color: 'shoulders-day' },
                    Friday: { muscle: 'Arms', color: 'arms-day' },
                    Saturday: { muscle: 'Full Body', color: 'fullbody-day' },
                    Sunday: { muscle: 'Rest', color: 'rest-day' }
                };

                this.exercisesByMuscle = {
                    'Chest & Triceps': ['Bench Press', 'Incline Dumbbell Press', 'Chest Fly', 'Tricep Dips', 'Close Grip Bench Press'],
                    'Back & Biceps': ['Pull-ups', 'Deadlift', 'Bent Over Row', 'Lat Pulldown', 'Barbell Curls'],
                    'Legs': ['Squats', 'Leg Press', 'Romanian Deadlift', 'Leg Curls', 'Calf Raises'],
                    'Shoulders': ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly', 'Upright Row'],
                    'Arms': ['Barbell Curls', 'Tricep Extensions', 'Hammer Curls', 'Diamond Push-ups', 'Preacher Curls'],
                    'Full Body': ['Burpees', 'Thrusters', 'Clean and Press', 'Mountain Climbers', 'Plank'],
                    'Rest': []
                };

                this.init();
            }

            init() {
                this.renderWeeklySplit();
                this.bindEvents();
            }

            bindEvents() {
                document.getElementById('split-nav').addEventListener('click', () => this.showSplitView());
                document.getElementById('progress-nav').addEventListener('click', () => this.showProgressView());
                document.getElementById('back-to-split').addEventListener('click', () => this.showSplitView());
                document.getElementById('back-to-progress').addEventListener('click', () => this.showProgressOverview());
            }

            showSplitView() {
                this.currentView = 'split';
                this.selectedDay = '';
                this.selectedWorkout = '';
                document.getElementById('split-view').classList.remove('hidden');
                document.getElementById('workout-view').classList.add('hidden');
                document.getElementById('progress-view').classList.add('hidden');
                this.updateNavigation();
            }

            showWorkoutView(day) {
                this.currentView = 'workout';
                this.selectedDay = day;
                document.getElementById('split-view').classList.add('hidden');
                document.getElementById('workout-view').classList.remove('hidden');
                document.getElementById('progress-view').classList.add('hidden');
                this.renderWorkoutView();
                this.updateNavigation();
            }

            showProgressView() {
                this.currentView = 'progress';
                this.selectedDay = '';
                this.selectedWorkout = '';
                document.getElementById('split-view').classList.add('hidden');
                document.getElementById('workout-view').classList.add('hidden');
                document.getElementById('progress-view').classList.remove('hidden');
                this.showProgressOverview();
                this.updateNavigation();
            }

            showProgressOverview() {
                this.selectedWorkout = '';
                document.getElementById('progress-overview').classList.remove('hidden');
                document.getElementById('progress-detail').classList.add('hidden');
                this.renderProgressView();
            }

            showProgressDetail(exercise) {
                this.selectedWorkout = exercise;
                document.getElementById('progress-overview').classList.add('hidden');
                document.getElementById('progress-detail').classList.remove('hidden');
                document.getElementById('progress-detail-title').textContent = `${exercise} Progress`;
                this.renderProgressChart(exercise);
            }

            updateNavigation() {
                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                if (this.currentView === 'split' || this.currentView === 'workout') {
                    document.getElementById('split-nav').classList.add('active');
                } else if (this.currentView === 'progress') {
                    document.getElementById('progress-nav').classList.add('active');
                }
            }

            renderWeeklySplit() {
                const grid = document.getElementById('weekly-grid');
                grid.innerHTML = '';

                Object.entries(this.weeklySchedule).forEach(([day, info]) => {
                    const card = document.createElement('div');
                    card.className = `day-card ${info.color} ${info.muscle === 'Rest' ? 'rest-day' : ''}`;
                    
                    if (info.muscle !== 'Rest') {
                        card.addEventListener('click', () => this.showWorkoutView(day));
                    }

                    card.innerHTML = `
                        <div class="day-header">
                            <h3 class="day-title">${day}</h3>
                            ${info.muscle !== 'Rest' ? '<span></span>' : ''}
                        </div>
                        <p class="muscle-group">${info.muscle}</p>
                        ${info.muscle !== 'Rest' ? '<p class="click-hint">Click to add workout</p>' : ''}
                    `;

                    grid.appendChild(card);
                });
            }

            renderWorkoutView() {
                const muscleGroup = this.weeklySchedule[this.selectedDay]?.muscle;
                const availableExercises = this.exercisesByMuscle[muscleGroup] || [];

                document.getElementById('workout-title').textContent = `${this.selectedDay} - ${muscleGroup}`;
                document.getElementById('workout-date').textContent = `Today's Date: ${new Date().toLocaleDateString()}`;

                // Render exercise buttons
                const buttonsContainer = document.getElementById('exercise-buttons');
                buttonsContainer.innerHTML = '';
                
                availableExercises.forEach(exercise => {
                    const button = document.createElement('button');
                    button.className = 'exercise-btn';
                    button.textContent = exercise;
                    button.addEventListener('click', () => this.addExercise(exercise));
                    buttonsContainer.appendChild(button);
                });

                this.renderWorkoutExercises();
            }

            renderWorkoutExercises() {
                const today = new Date().toISOString().split('T')[0];
                const dayKey = `${this.selectedDay}-${today}`;
                const todayWorkout = this.workouts[dayKey];
                const container = document.getElementById('workout-exercises');
                container.innerHTML = '';

                if (todayWorkout?.exercises) {
                    todayWorkout.exercises.forEach((exercise, exerciseIndex) => {
                        const exerciseCard = document.createElement('div');
                        exerciseCard.className = 'exercise-card';
                        
                        let setsHTML = '';
                        exercise.sets.forEach((set, setIndex) => {
                            setsHTML += `
                                <tr>
                                    <td>${setIndex + 1}</td>
                                    <td><input type="number" value="${set.reps}" min="1" onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'reps', this.value)"></td>
                                    <td><input type="number" value="${set.weight}" min="0" step="0.5" onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'weight', this.value)"></td>
                                    <td>${set.weight * set.reps} kg</td>
                                </tr>
                            `;
                        });

                        exerciseCard.innerHTML = `
                            <h4 class="exercise-title">${exercise.name}</h4>
                            <table class="sets-table">
                                <thead>
                                    <tr>
                                        <th>Set</th>
                                        <th>Reps</th>
                                        <th>Weight (kg)</th>
                                        <th>Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${setsHTML}
                                </tbody>
                            </table>
                            <button class="add-set-btn" onclick="app.addSet(${exerciseIndex})">
                                <span>+</span> Add Set
                            </button>
                        `;

                        container.appendChild(exerciseCard);
                    });
                }
            }

            addExercise(exerciseName) {
                const today = new Date().toISOString().split('T')[0];
                const dayKey = `${this.selectedDay}-${today}`;
                
                if (!this.workouts[dayKey]) {
                    this.workouts[dayKey] = {
                        date: today,
                        exercises: []
                    };
                }

                this.workouts[dayKey].exercises.push({
                    name: exerciseName,
                    sets: [{ reps: 8, weight: 0 }]
                });

                this.renderWorkoutExercises();
            }

            updateSet(exerciseIndex, setIndex, field, value) {
                const today = new Date().toISOString().split('T')[0];
                const dayKey = `${this.selectedDay}-${today}`;
                
                if (!this.workouts[dayKey]) {
                    this.workouts[dayKey] = {
                        date: today,
                        exercises: []
                    };
                }

                this.workouts[dayKey].exercises[exerciseIndex].sets[setIndex][field] = Number(value) || 0;
                this.renderWorkoutExercises();
            }

            addSet(exerciseIndex) {
                const today = new Date().toISOString().split('T')[0];
                const dayKey = `${this.selectedDay}-${today}`;
                
                this.workouts[dayKey].exercises[exerciseIndex].sets.push({ reps: 8, weight: 0 });
                this.renderWorkoutExercises();
            }

            calculateVolume(sets) {
                return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
            }

            getAllExercises() {
                const exercises = new Set();
                Object.values(this.workouts).forEach(workout => {
                    workout.exercises.forEach(ex => exercises.add(ex.name));
                });
                return Array.from(exercises);
            }

            getProgressData(exerciseName) {
                const data = [];
                Object.entries(this.workouts).forEach(([key, workout]) => {
                    const exercise = workout.exercises.find(ex => ex.name === exerciseName);
                    if (exercise) {
                        const volume = this.calculateVolume(exercise.sets);
                        const date = key.split('-').slice(1).join('-');
                        data.push({
                            date,
                            volume,
                            displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        });
                    }
                });
                return data.sort((a, b) => new Date(a.date) - new Date(b.date));
            }

            renderProgressView() {
                const allExercises = this.getAllExercises();
                const grid = document.getElementById('progress-grid');
                grid.innerHTML = '';

                allExercises.forEach(exercise => {
                    const progressData = this.getProgressData(exercise);
                    const totalSessions = progressData.length;
                    const latestVolume = progressData[progressData.length - 1]?.volume || 0;

                    const card = document.createElement('div');
                    card.className = 'progress-card';
                    card.addEventListener('click', () => this.showProgressDetail(exercise));

                    card.innerHTML = `
                        <div class="progress-header">
                            <h3 class="progress-title">${exercise}</h3>
                            <span>📊</span>
                        </div>
                        <div class="progress-stats">
                            <p>Sessions: ${totalSessions}</p>
                            <p>Latest Volume: ${latestVolume} kg</p>
                        </div>
                        <div class="progress-hint">Click to view detailed progress</div>
                    `;

                    grid.appendChild(card);
                });
            }

            renderProgressChart(exercise) {
                const ctx = document.getElementById('progress-chart').getContext('2d');
                const progressData = this.getProgressData(exercise);

                if (this.chart) {
                    this.chart.destroy();
                }

                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: progressData.map(d => d.displayDate),
                        datasets: [{
                            label: 'Volume (kg)',
                            data: progressData.map(d => d.volume),
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            pointBackgroundColor: '#3B82F6',
                            pointBorderColor: '#1D4ED8',
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Volume (kg)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: `${exercise} Progress Over Time`
                            }
                        }
                    }
                });
            }
        }

        // Initialize the app
        const app = new WorkoutTracker();
        