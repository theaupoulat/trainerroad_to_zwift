setInterval(function () {
  if (
    document.getElementById("workoutOverviewStats") &&
    !document.getElementById("zwiftButton")
  ) {
    addZwiftExportButton("workoutOverviewStats");
  } else if (
    document.getElementById("add") &&
    !document.getElementById("zwiftButton")
  ) {
    addZwiftExportButton("add");
  }
}, 500);

function addZwiftExportButton(siblingId) {
  const targetElement = document.getElementById(siblingId);
  const zwiftButton = createZwiftButton();
  let parentDiv = targetElement.parentNode;
  if (document.getElementById("workoutOverviewStats")) {
    const scheduleButtonDiv = parentDiv.children[1];
    scheduleButtonDiv.insertBefore(zwiftButton, scheduleButtonDiv.children[0]);
  } else {
    parentDiv.insertBefore(zwiftButton, parentDiv.children[0]);
  }
}

function createZwiftButton() {
  let zwiftButton = document.createElement("button");
  zwiftButton.onclick = getWorkoutData;
  zwiftButton.innerHTML = "Export to Zwift";
  zwiftButton.setAttribute("id", "zwiftButton");

  if (document.getElementById("workoutOverviewStats")) {
    zwiftButton.classList.add(
      "button",
      "button--ghost",
      "button--light",
      "button--normal"
    );
    zwiftButton.style.backgroundColor = "#fd671a";
    zwiftButton.style.borderColor = "#fd671a";
    zwiftButton.setAttribute("trbutton", "");
    zwiftButton.setAttribute("_nghost-c3", "");
    zwiftButton.style.color = "white";
  } else {
    zwiftButton.classList.add(
      "Button__button___3ip3e",
      "Button__button--blue___2e46W",
      "Button__button--small___rtJlF"
    );
  }
  zwiftButton.style.marginRight = "5px";

  return zwiftButton;
}

function getWorkoutId() {
  let workoutId;
  const isWorkoutPage = document.getElementById("workoutOverviewStats");
  const isCalendarModal = document.getElementById("add");
  if (isWorkoutPage) {
    const pageUrl = window.location.href;
    const workoutDenominator = pageUrl.replace(
      "https://www.trainerroad.com/app/cycling/workouts/",
      ""
    );
    workoutId = workoutDenominator.split("-")[0];
  } else if (isCalendarModal) {
    let workout = document.getElementById("mp__calendar--modal-workout-card");
    const workoutImage =
      workout.children[0].children[0].children[0].children[0];
    let workoutImageSource = workoutImage.src;
    let splitted = workoutImageSource.split("/");
    workoutId = splitted[splitted.indexOf("workouts") + 1];
  }
  return workoutId;
}

function exportToXml(workoutName, workoutString) {
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
}

function getWorkoutData() {
  const apiUrl = "https://www.trainerroad.com/app/api/workoutdetails/";
  const workoutId = getWorkoutId();

  fetch(apiUrl + workoutId)
    .then((response) => response.json())
    .then((data) => {
      const { Workout } = data;
      const workoutName = Workout.Details.WorkoutName;
      const { intervalData } = Workout;
      let workoutString = "";
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

      exportToXml(workoutName, workoutString);
    });
}
