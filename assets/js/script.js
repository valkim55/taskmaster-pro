var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  // addClass() method updates an element's class attribute with new values
  var taskLi = $("<li>").addClass("list-group-item");  

// text() method changes the text content of the element
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate); 

  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  // executing audit() before adding the task item to the page to ensure the elements has all its properties before getitng to the page
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// enable coloring the tasks if the due date is coming soon
var auditTask = function(taskEl) {
  console.log(taskEl);

  /* when a tasl element is sent to the auditTask(), we can get the date information and parse it into a moment object. using jquery we select the taskel element
  and find the <span> element inisde it, then retrieve the text value using .text() */
  //get date from task element
  var date = $(taskEl).find("span").text().trim();
  console.log(date);

  /* first, use date variable DATE to make a new moment object, configured for the suer's local time useing moment(date, "L"). 
  because the date variable didn't specify time of the day the moment object will default to 12am. that's why we converted it to 17 which is 5pm using .set("hour", 17) */
  //convert to moment object at 5pm
  var time = moment(date, "L").set("hour", 17);
  //should print out the object for the value of the date variable but at 5pm of that date
  console.log(time);

  //now let's check if the date has passed
  //remove all classes from element so we can replace them with an appropriate color after
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  //chekcing if the current date and time are later than the date and time we pulled from taskEl, if so we add list-group-item-danger so the box turns red
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } // now check if the due date is imminent, abs() method ensures we're getting absolute value
  else if (Math.abs(moment().diff(time, "days")) <=2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};


// using class list-group to delegate clicks from <p> elements to the parent <ul>
// the tasks will be inside the <p> elements that are targeted in the click listener
$(".list-group").on("click", "p", function() {
  var text = $(this).text().trim(); //doesn't work!
  //var text = $(this).text();
  console.log(text);

  /* if it was $("textarea") it'd tell jQuery to find all existing <textarea> elements - it uses the element name as a selector, 
  but this syntax tells jQuery to create a new <textarea> element - using the HTML syntax <> to indicate that the element is to be created*/
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  
  // to swap the existing <p> element with the new <textarea>
  $(this).replaceWith(textInput);
  // focus highlights the inputs box when user clicks on the input area
  textInput.trigger("focus");
});

// <textarea> revert back when it goes out of focus when user is done editing
// the blur event will trigger as soon as the user interacts with anything other than <textarea> element
$(".list-group").on("blur", "textarea", function() {
  // when blur event triggers, we need to collect: current value of the element, parent element's id, element's position in the list
  // this data will help to update the correct task in the data object
  var text = $(this).val().trim();

  var status =$(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", ""); // regular Javacript operator to find and replace text in a string

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // update tasks object with the new data, but since we don't know the values use the variable names as placeholders
  // returns the text property of the object at the given index of the array
  // updating this tasks object is also necessary for localStorage
  tasks[status][index].text = text;
  saveTasks();

  //convert <textarea> back into a <p> element
  // recreate a p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);
});


//dues dates are wrapped in span elements that area children of the .list-group, so we can delegate the click as we did for <p> elements
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this).text().trim();

  //craete new input element
  var dateInput = $("<input>")
  // in jquery, attr(arg1) with only ONE argument gets an attribute. attr(arg1, arg2) with TWO arguments sets an attribute
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  //automatically focus on new element
  dateInput.trigger("focus");
});

// convert due dates baack from text when the user clicks outside of the input area
// when value of the due date was changed
// switched blur event for change because blur recognised the changes were made since we literally typed the date in the input area, but now we're picking the date
$(".list-group").on("change", "input[type='text']", function() {
  //get current text
  var date = $(this).val().trim();

  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  
  //update the task in aray and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  //pass task's <li element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});


// use jQuery selector to find all .list=group elements and then call a new jquery UI method on them
// allows to drag the tasks and move them around within and across the columns
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",

  // helper:clone tells jQuery to create a copy of the dragged element and move the ocpy instead of original (prevents click events form triggering on the original element)
  helper: "clone",

  // activate and deactivate events trigger once for all connected lists as soon as dragging starts and stops
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },

  // over and out events trigger when a dragged elements enters or elaves the connected list
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  }, 
  
  // update triggers when the contents of a list have changed (re-ordered, removed etc)
  update: function(event) {

    //array to store the task data that we use below in the loop. 
    var tempArr = [];

    // 'this' refers to the list that's currently being affected by update
    // thanks to children() method updated list elements match those saved in the localStorage. Next we need to loop over the elements pushing their text values into a new tasks array
    // each() method calls a callback function on each loop iteration, running a callback fundtion for every item/element in the array
    $(this).children().each(function() {
      // loop over current set of children in sortable list
      var text = $(this).find("p").text().trim();
      var date = $(this).find("span").text().trim();
      
      // combine task data in an object to push into an array above
      tempArr.push({
        text: text,
        date: date
      });
    });
    console.log(tempArr);

    // get each tasktype's id to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on task object and save, so now once we drag the tasks between different types of lists if we refresh the browser they'll stay in a new place
    tasks[arrName] = tempArr;
    saveTasks();
  }
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  // make sure user inputs both: task description and date
  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});


// drag the tasks to the trash container one by one
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",

  // ui is an object that contains the property called draggable
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// if we were to write the drag function in plain javascript it'd have been:
/* pageContentEl.addEventListener("dragstart", function(event) {

}); */


// add a datepicker 
$("#modalDueDate").datepicker({
  // set minDate option to disable picking the date that has already passed. sets how many days after the current date we need the limit to kick in
  minDate: 1
});


// load tasks for the first time
loadTasks();


