setTimeout(function () {
  const scheduleButton = document.getElementById("workoutOverviewStats");
  console.log(scheduleButton);
  let zwiftButton = document.createElement("button");
  zwiftButton.onclick = getWorkoutData;
  zwiftButton.innerHTML = "Export to Zwift";
  console.log(scheduleButton);
  let parentDiv = scheduleButton.parentNode;

  parentDiv.insertBefore(zwiftButton, scheduleButton.nextSibling);
}, 4000);

function getWorkoutData() {
  const apiUrl = "https://www.trainerroad.com/app/api/workoutdetails/";
  const pageUrl = window.location.href;
  console.log(pageUrl);
  const workoutDenominator = pageUrl.replace(
    "https://www.trainerroad.com/app/cycling/workouts/",
    ""
  );
  console.log(workoutDenominator);
  const workoutId = workoutDenominator.split("-")[0];
  fetch(apiUrl + workoutId)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const { Workout } = data;
      const workoutName = Workout.Details.WorkoutName;
      const { intervalData } = Workout;
      let workoutString = "";
      // funcion to transform interval data to Zwift workout
      for (let interval of intervalData) {
        if (interval.Name === "Workout") {
          continue;
        }
        const duration = interval.End - interval.Start;
        const power = interval.StartTargetPowerPercent / 100;
        const pace = 0;
        const workoutInterval = `<SteadyState Duration="${duration}" Power="${power}" pace="${pace}"/>\n`;
        workoutString = workoutString.concat(workoutInterval);
      }

      const xml = `
<workout_file>
  <author/>
  <name>${workoutName}</name>
  <tags>
    <tag name="TrainerRoad"/>
  </tags>
  <description/>
  <sportType>bike</sportType>
  <durationType>time</durationType>
  <tags/>
  <workout>
    ${workoutString}
  </workout>
</workout_file>
`;

      console.log(xml);

      const filename = workoutName + ".zwo";

      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(xml)
      );
      element.setAttribute("download", filename);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    });
}
