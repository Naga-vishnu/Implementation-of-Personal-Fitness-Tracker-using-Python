/* jshint esversion: 6 */

document.addEventListener("DOMContentLoaded", function () {
    let workoutTable = document.getElementById("workoutTable");
    let exercisePieChartCanvas = document.getElementById("exercisePieChart");
    let startButton = document.getElementById("startWorkout");
    let stopButton = document.getElementById("stopWorkout");
    let workoutTimer = document.getElementById("workoutTimer");
    let exerciseSelect = document.getElementById("exercise");
    
    let timer = null;
    let secondsElapsed = 0;
    let exerciseCounts = {};

    // Extract workout data from the table
    Array.from(workoutTable.getElementsByTagName("tr")).forEach(row => {
        let cells = row.getElementsByTagName("td");
        if (cells.length > 1) { 
            let exercise = cells[1].textContent.trim();
            exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1;
        }
    });

    // Prepare data for the Pie Chart
    let chartData = {
        labels: Object.keys(exerciseCounts),
        datasets: [{
            data: Object.values(exerciseCounts),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"],
        }]
    };

    // Render Pie Chart
    let exercisePieChart = new Chart(exercisePieChartCanvas, {
        type: "pie",
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                }
            }
        }
    });

    // Start Workout Timer
    startButton.addEventListener("click", function () {
        startButton.disabled = true;
        stopButton.disabled = false;
        secondsElapsed = 0;

        timer = setInterval(function () {
            secondsElapsed++;
            workoutTimer.textContent = secondsElapsed;
        }, 1000);
    });

    // Stop Workout and Log Data
    stopButton.addEventListener("click", function () {
        clearInterval(timer);
        startButton.disabled = false;
        stopButton.disabled = true;

        let durationMinutes = (secondsElapsed / 60).toFixed(2);
        let selectedExercise = exerciseSelect.value;
        let caloriesBurned = (durationMinutes * 5).toFixed(2);

        // Add Workout to Table
        let newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${new Date().toLocaleDateString()}</td>
            <td>${selectedExercise}</td>
            <td>${durationMinutes}</td>
            <td>${caloriesBurned}</td>
            <td>
                <button class="btn btn-danger btn-sm deleteWorkout">Delete</button>
            </td>
        `;
        workoutTable.appendChild(newRow);

        // Update Chart Data
        exerciseCounts[selectedExercise] = (exerciseCounts[selectedExercise] || 0) + 1;
        exercisePieChart.data.labels = Object.keys(exerciseCounts);
        exercisePieChart.data.datasets[0].data = Object.values(exerciseCounts);
        exercisePieChart.update();

        // Delete Workout Function
        newRow.querySelector(".deleteWorkout").addEventListener("click", function () {
            let index = exercisePieChart.data.labels.indexOf(newRow.cells[1].textContent);
            if (index > -1) {
                exerciseCounts[newRow.cells[1].textContent]--;
                if (exerciseCounts[newRow.cells[1].textContent] === 0) {
                    delete exerciseCounts[newRow.cells[1].textContent];
                }
                exercisePieChart.data.labels = Object.keys(exerciseCounts);
                exercisePieChart.data.datasets[0].data = Object.values(exerciseCounts);
                exercisePieChart.update();
            }
            newRow.remove();
        });

        alert(`Workout saved! Duration: ${durationMinutes} minutes.`);
    });
});
