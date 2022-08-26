var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item"); // addClass() method updates an element's class attribute with new values 
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate); // text() method changes the text content of the element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

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

  //automatically focus on new element
  dateInput.trigger("focus");
});

// convert due dates baack from text when the user clicks outside of the input area
// when value of the due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
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
})



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

// load tasks for the first time
loadTasks();


