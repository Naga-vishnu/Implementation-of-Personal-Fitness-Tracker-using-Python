/* jshint esversion: 6 */

let startButton = document.getElementById("startWorkout");
let stopButton = document.getElementById("stopWorkout");
let workoutTimer = document.getElementById("workoutTimer");
let exerciseSelect = document.getElementById("exercise");
let workoutTable = document.querySelector("tbody");

let timer = null;
let secondsElapsed = 0;

startButton.addEventListener("click", function () {
    startButton.disabled = true;
    stopButton.disabled = false;
    secondsElapsed = 0;

    // Start the timer
    timer = setInterval(function () {
        secondsElapsed++;
        workoutTimer.textContent = secondsElapsed;
    }, 1000);
});

stopButton.addEventListener("click", function () {
    clearInterval(timer);
    startButton.disabled = false;
    stopButton.disabled = true;

    let durationMinutes = (secondsElapsed / 60).toFixed(2);
    let selectedExercise = exerciseSelect.value;
    let caloriesBurned = (durationMinutes * 5).toFixed(2); // Example: 5 cal per min

    // Create a new row in the table
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${new Date().toLocaleDateString()}</td>
        <td>${selectedExercise}</td>
        <td>${durationMinutes}</td>
        <td>${caloriesBurned}</td>
        <td>
            <button class="btn btn-warning btn-sm">Edit</button>
            <button class="btn btn-danger btn-sm deleteWorkout">Delete</button>
        </td>
    `;
    
    // Append the new row to the table
    workoutTable.appendChild(newRow);

    // Add event listener for delete button
    newRow.querySelector(".deleteWorkout").addEventListener("click", function () {
        newRow.remove();
    });

    alert(`Workout saved! Duration: ${durationMinutes} minutes.`);
});
