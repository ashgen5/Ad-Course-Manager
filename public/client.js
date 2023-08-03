"use strict";

const loginForm = document.querySelector(".login--section");
const registerForm = document.querySelector("#register-form");
const profileSection = document.getElementById("profile-section");
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const modal = document.getElementById("errorModal");
const divider = document.querySelector(".or--divider");
const mainLogin = document.querySelector(".main-login");

window.onload = function () {
  displayRegistrationMessage();
};

let headerGenerated = false;

// window.onload = verifyToken;

// window.addEventListener("popstate", verifyToken);

// async function verifyToken() {
//   const token = localStorage.getItem("token");

//   // const loginSection = document.getElementById("login-section");
//   // const profileSection = document.getElementById("profile-section");

//   if (token) {
//     try {
//       const response = await fetch("http://localhost:3000/user/verify", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Token verification failed");
//       }

//       const { user } = await response.json();

//
//       loginSection.style.display = "none";
//       mainLogin.style.display = "none";
//       profileSection.style.display = "block";

//
//       generateUserProfile(user);
//       fetchAndDisplayCourses();
//     } catch (error) {
//       console.error(error);
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//
//       loginSection.style.display = "block";
//       profileSection.style.display = "none";
//       mainLogin.style.display = "block";
//     }
//   } else {
//
//     loginSection.style.display = "block";
//     profileSection.style.display = "none";
//   }
// }

function displayCourses(courses) {
  let courseList = document.getElementById("course-list");
  if (!courseList) {
    courseList = document.createElement("div");
    courseList.id = "course-list";
    document.body.appendChild(courseList);
  }

  courseList.innerHTML = "";

  for (const course of courses) {
    const courseCard = document.createElement("div");
    courseCard.classList.add("card", "my-3");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const courseTitle = document.createElement("h5");
    courseTitle.classList.add("card-title");
    courseTitle.textContent = course.name;

    const courseDescription = document.createElement("p");
    courseDescription.classList.add("card-text");
    courseDescription.textContent = course.description;

    cardBody.appendChild(courseTitle);
    cardBody.appendChild(courseDescription);
    courseCard.appendChild(cardBody);
    courseList.appendChild(courseCard);
  }
}

async function fetchDepartments() {
  try {
    const response = await fetch(
      "http://localhost:3000/department/all-departments"
    );
    const departments = await response.json();

    const departmentsContainer = document.getElementById("departments");

    departmentsContainer.innerHTML = "";

    departments.forEach((department) => {
      const div = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "departments";
      checkbox.value = department._id;

      const label = document.createElement("label");
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(department.name));

      div.appendChild(label);
      departmentsContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

async function fetchDepartmentsForAllCourses() {
  try {
    const response = await fetch(
      "http://localhost:3000/department/all-departments",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Error fetching departments");
      return [];
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

async function displayCoursesByDepartment() {
  try {
    const departments = await fetchDepartmentsForAllCourses();
    const response = await fetch("http://localhost:3000/course/courses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching courses");
    }

    const courses = await response.json();

    const section = document.getElementById("courses-by-department-section");

    section.innerHTML = "";

    const accordion = document.createElement("div");
    accordion.classList.add("accordion");
    accordion.id = "course-accordion";

    let counter = 0;
    for (const department of departments) {
      const departmentCourses = courses.filter(
        (course) =>
          course.department && course.department._id === department._id
      );

      const accordionItem = createAccordionItem(
        department.name,
        departmentCourses,
        counter++
      );
      accordion.appendChild(accordionItem);
    }

    const coursesWithoutDepartment = courses.filter(
      (course) => !course.department
    );
    if (coursesWithoutDepartment.length > 0) {
      const accordionItem = createAccordionItem(
        "Other Courses",
        coursesWithoutDepartment,
        counter++
      );
      accordion.appendChild(accordionItem);
    }

    section.appendChild(accordion);
  } catch (error) {
    console.error("Error while fetching courses or departments: ", error);
  }
}

function createAccordionItem(departmentName, courses, index) {
  const accordionItem = document.createElement("div");
  accordionItem.classList.add("accordion-item", "mb-3");

  const accordionHeader = document.createElement("h2");
  accordionHeader.classList.add("accordion-header");
  accordionHeader.id = `heading${index}`;

  const accordionButton = document.createElement("button");
  accordionButton.classList.add("accordion-button", "collapsed");
  accordionButton.setAttribute("type", "button");
  accordionButton.setAttribute("data-bs-toggle", "collapse");
  accordionButton.setAttribute("data-bs-target", `#collapse${index}`);
  accordionButton.setAttribute("aria-expanded", "false");
  accordionButton.setAttribute("aria-controls", `collapse${index}`);
  accordionButton.textContent = departmentName;

  accordionHeader.appendChild(accordionButton);

  const accordionCollapse = document.createElement("div");
  accordionCollapse.classList.add("accordion-collapse", "collapse");
  accordionCollapse.id = `collapse${index}`;
  accordionCollapse.setAttribute("aria-labelledby", `heading${index}`);
  accordionCollapse.setAttribute("data-bs-parent", "#course-accordion");

  const accordionBody = document.createElement("div");
  accordionBody.classList.add("accordion-body");

  for (const course of courses) {
    const courseCard = createCourseCard(course);
    accordionBody.appendChild(courseCard);
  }

  accordionCollapse.appendChild(accordionBody);
  accordionItem.appendChild(accordionHeader);
  accordionItem.appendChild(accordionCollapse);

  return accordionItem;
}

function createCourseCard(course) {
  const courseCard = document.createElement("div");
  courseCard.classList.add("card", "my-3");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const courseTitle = document.createElement("h5");
  courseTitle.classList.add("card-title");
  courseTitle.textContent = course.name;

  const courseDescription = document.createElement("p");
  courseDescription.classList.add("card-text");
  courseDescription.textContent = course.description;

  cardBody.appendChild(courseTitle);
  cardBody.appendChild(courseDescription);
  courseCard.appendChild(cardBody);

  return courseCard;
}

async function fetchUserRatingForCourse(courseId, userId, token) {
  const response = await fetch(
    `http://localhost:3000/course/${courseId}/user/${userId}/rating`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 204) {
    return 0;
  }

  if (response.ok) {
    const data = await response.json();
    return data.rating;
  } else {
    const errorData = await response.json();
    console.error("Error fetching user rating:", errorData.message);
    return null;
  }
}

async function rateCourse(courseId, token, rating) {
  const response = await fetch(
    `http://localhost:3000/course/${courseId}/rate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating }),
    }
  );

  if (response.ok) {
    alert("Rating submitted!");
    const starContainer = document.querySelector(
      `[data-course-id="${courseId}"]`
    );
    starContainer.innerHTML = createStarElements(rating);
  } else {
    const errorData = await response.json();
    console.error("Error rating course:", errorData.message);
  }
}

function createStarElements(rating) {
  const maxRating = 5;
  let starElements = "";

  for (let i = 1; i <= maxRating; i++) {
    if (i <= rating) {
      starElements += `<span class="star filled-star" data-rating="${i}">★</span>`;
    } else {
      starElements += `<span class="star empty-star" data-rating="${i}">☆</span>`;
    }
  }

  return starElements;
}

async function finishCourse(courseId, token) {
  const response = await fetch(
    `http://localhost:3000/course/${courseId}/finish`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.ok) {
    fetchAndDisplayCourses();
  } else {
    const errorData = await response.json();
    console.error("Error finishing course:", errorData.message);
  }
}

function displayRegistrationMessage() {
  const registrationMessage = localStorage.getItem("registrationSuccessful");

  if (registrationMessage) {
    const messageBox = document.getElementById("messageBox");

    messageBox.style.display = "block";
    const message = document.createElement("p");
    message.textContent = registrationMessage;
    messageBox.appendChild(message);
    localStorage.removeItem("registrationSuccessful");
  }
}

async function submitComment(courseId, token, comment) {
  const response = await fetch(
    `http://localhost:3000/course/${courseId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ comment }),
    }
  );

  if (response.ok) {
    alert("Comment submitted successfully!");
  } else {
    const errorData = await response.json();
    console.error("Error submitting comment:", errorData.message);
  }
}

async function fetchAndDisplayCourses() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/course/user-courses", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();

    if (!data) {
      console.error("Received null data from server.");
      return;
    }

    const { enrolledCourses = [], completedCourses = [] } = data;

    document.getElementById("enrolledAccordion").innerHTML = "";
    document.getElementById("completedAccordion").innerHTML = "";

    const enrolledCoursesTitle = document.createElement("h2");
    enrolledCoursesTitle.textContent = "Enrolled Courses";
    document
      .getElementById("enrolledAccordion")
      .appendChild(enrolledCoursesTitle);

    for (let index = 0; index < enrolledCourses.length; index++) {
      const course = enrolledCourses[index];
      const userRating = await fetchUserRatingForCourse(
        course._id,
        user._id,
        token
      );

      const courseElement = document.createElement("div");
      courseElement.classList.add("accordion-item");

      const h2 = document.createElement("h2");
      h2.classList.add("accordion-header");
      h2.id = `enrolledHeading${index}`;

      const button = document.createElement("button");
      button.classList.add("accordion-button", "collapsed");
      button.type = "button";
      button.dataset.bsToggle = "collapse";
      button.dataset.bsTarget = `#enrolledCollapse${index}`;
      button.textContent = course.name;

      h2.appendChild(button);

      const div = document.createElement("div");
      div.id = `enrolledCollapse${index}`;
      div.classList.add("accordion-collapse", "collapse");
      div.dataset.bsParent = "#enrolledAccordion";

      const body = document.createElement("div");
      body.classList.add("accordion-body");
      body.innerHTML = `
        <p>${course.description}</p>
        <a href="${course.link}" class="btn btn-primary">Go to Course</a>
      `;

      const finishButton = document.createElement("button");
      finishButton.classList.add("btn", "btn-success");
      finishButton.textContent = "Finish Course";
      finishButton.onclick = () => finishCourse(course._id, token);
      body.appendChild(finishButton);

      const starContainer = document.createElement("div");
      starContainer.classList.add("star-container");
      starContainer.dataset.courseId = course._id;

      if (userRating !== null) {
        starContainer.innerHTML = createStarElements(userRating);
      } else {
        starContainer.innerHTML = createStarElements(0);
      }
      body.appendChild(starContainer);

      starContainer.querySelectorAll(".star").forEach((star) => {
        star.addEventListener("click", (event) => {
          const rating = event.target.dataset.rating;
          rateCourse(course._id, token, rating);
        });
      });

      div.appendChild(body);
      courseElement.appendChild(h2);
      courseElement.appendChild(div);

      document.getElementById("enrolledAccordion").appendChild(courseElement);

      if (index < enrolledCourses.length - 1) {
        const horizontalLine = document.createElement("hr");
        document
          .getElementById("enrolledAccordion")
          .appendChild(horizontalLine);
      }
    }

    const completedCoursesTitle = document.createElement("h2");
    completedCoursesTitle.textContent = "Completed Courses";
    document
      .getElementById("completedAccordion")
      .appendChild(completedCoursesTitle);
    completedCourses.forEach((course, index) => {
      const courseElement = document.createElement("div");
      courseElement.classList.add("accordion-item");

      const h2 = document.createElement("h2");
      h2.classList.add("accordion-header");
      h2.id = `completedHeading${index}`;

      const button = document.createElement("button");
      button.classList.add("accordion-button", "collapsed");
      button.type = "button";
      button.dataset.bsToggle = "collapse";
      button.dataset.bsTarget = `#completedCollapse${index}`;
      button.textContent = course.name;

      h2.appendChild(button);

      const div = document.createElement("div");
      div.id = `completedCollapse${index}`;
      div.classList.add("accordion-collapse", "collapse");
      div.dataset.bsParent = "#completedAccordion";

      const body = document.createElement("div");
      body.classList.add("accordion-body");
      body.innerHTML = `
          <p>${course.description}</p>
          <a href="${course.link}" class="btn btn-primary">Go to Course</a>
        `;

      const commentSection = document.createElement("div");
      commentSection.style.marginTop = "30px";
      const commentInput = document.createElement("textarea");
      commentInput.placeholder = "Enter your comment here...";
      commentInput.style.width = "100%";
      commentInput.style.padding = "10px";
      commentInput.style.marginBottom = "10px";
      commentSection.appendChild(commentInput);

      const submitCommentButton = document.createElement("button");
      submitCommentButton.classList.add("btn", "btn-primary");
      submitCommentButton.textContent = "Submit Comment";
      submitCommentButton.onclick = () => {
        submitComment(course._id, token, commentInput.value);
        commentInput.value = "";
      };
      commentSection.appendChild(submitCommentButton);

      body.appendChild(commentSection);

      div.appendChild(body);
      courseElement.appendChild(h2);
      courseElement.appendChild(div);

      document.getElementById("completedAccordion").appendChild(courseElement);

      if (index < completedCourses.length - 1) {
        const horizontalLine = document.createElement("hr");
        document
          .getElementById("completedAccordion")
          .appendChild(horizontalLine);
      }
    });
  } else {
    const errorData = await response.json();
    console.error("Error fetching courses:", errorData.message);
  }
}

function displaySearchResults(courses) {
  const searchResultsDiv = document.getElementById("search-results");

  searchResultsDiv.innerHTML = "";

  const user = JSON.parse(localStorage.getItem("user"));

  courses.forEach((course) => {
    const courseDiv = document.createElement("div");
    const courseName = document.createElement("h3");
    const courseKeySkills = document.createElement("p");
    const enrollButton = document.createElement("button");

    courseName.textContent = course.name;
    courseKeySkills.textContent = "Skills: " + course.keySkills.join(", ");

    if (user.enrolledCourses.includes(course._id)) {
      enrollButton.textContent = "Already Enrolled";
      enrollButton.classList.add("btn", "btn-secondary");
      enrollButton.disabled = true;
    } else if (user.completedCourses.includes(course._id)) {
      enrollButton.textContent = "Course Completed";
      enrollButton.classList.add("btn", "btn-success");
      enrollButton.disabled = true;
    } else {
      enrollButton.textContent = "Enroll";
      enrollButton.classList.add("btn", "btn-primary");
      enrollButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/course/enroll`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course._id }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data.message);

          const userResponse = await fetch(
            "http://localhost:3000/user/getUser",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (userResponse.ok) {
            const updatedUser = await userResponse.json();

            localStorage.setItem("user", JSON.stringify(updatedUser));
          }

          fetchAndDisplayCourses();
          document.getElementById("search-section").style.display = "none";
          document.getElementById("profile-section").style.display = "block";
        } else {
          const errorData = await response.json();
          console.error("Error enrolling in a course: ", errorData.message);
        }
      });
    }

    enrollButton.classList.add("btn", "btn-primary");

    courseDiv.appendChild(courseName);
    courseDiv.appendChild(courseKeySkills);
    courseDiv.appendChild(enrollButton);
    searchResultsDiv.appendChild(courseDiv);
  });
}

function generateUserProfile(user) {
  loginSection.style.display = "none";
  registerSection.style.display = "none";
  mainLogin.style.display = "none";
  profileSection.style.display = "block";
  divider.style.display = "none";

  if (headerGenerated) return;

  const oldHeader = document.querySelector(".header--front");
  oldHeader.style.display = "none";

  const newHeader = document.createElement("header");
  newHeader.classList.add("header-profile");

  // const profileImg = document.createElement("img");
  // profileImg.id = "profile-pic";
  // profileImg.src = user.profilePic
  //   ? user.profilePic
  //   : "../imgs/default photo.jpg";

  // newHeader.appendChild(profileImg);

  const userName = document.createElement("h2");
  userName.id = "username";
  userName.textContent = user.name;
  newHeader.appendChild(userName);

  const menu = document.createElement("div");
  menu.className = "menu";

  const profileLink = document.createElement("a");
  profileLink.href = "#";
  profileLink.textContent = "Profile";
  profileLink.addEventListener("click", handleProfileLinkClick);

  const accountLink = document.createElement("a");
  accountLink.href = "#";
  accountLink.textContent = "Account";
  accountLink.addEventListener("click", handleAccountLinkClick);

  const coursesLink = document.createElement("a");
  coursesLink.href = "#";
  coursesLink.textContent = "All Courses";
  coursesLink.addEventListener("click", handleCoursesLinkClick);

  const coursesByDepartmentLink = document.createElement("a");
  coursesByDepartmentLink.href = "#";
  coursesByDepartmentLink.textContent = "Courses by Department";
  coursesByDepartmentLink.addEventListener(
    "click",
    handleCoursesByDepartmentLinkClick
  );

  const logoutButton = document.createElement("button");
  logoutButton.textContent = "Logout";
  logoutButton.classList.add("btn", "btn-secondary");
  logoutButton.addEventListener("click", handleLogoutClick);

  const hamburgerButton = document.createElement("button");
  hamburgerButton.className = "hamburger-button";
  for (let i = 0; i < 3; i++) {
    const line = document.createElement("div");
    line.className = "line";
    hamburgerButton.appendChild(line);
  }

  const dropdownContent = document.createElement("div");
  dropdownContent.className = "dropdown-content";
  dropdownContent.appendChild(profileLink);
  dropdownContent.appendChild(accountLink);
  dropdownContent.appendChild(coursesLink);
  dropdownContent.appendChild(logoutButton);

  menu.appendChild(hamburgerButton);
  menu.appendChild(dropdownContent);
  newHeader.appendChild(menu);

  if (user.role === "admin") {
    const addCoursesLink = document.createElement("a");
    addCoursesLink.href = "#";
    addCoursesLink.textContent = "Add Courses";
    addCoursesLink.addEventListener("click", handleAddCourseLinkClick);

    const addDepartmentsLink = document.createElement("a");
    addDepartmentsLink.href = "#";
    addDepartmentsLink.textContent = "Add Departments";
    addDepartmentsLink.addEventListener("click", handleAddDepartmentLinkClick);

    dropdownContent.appendChild(addCoursesLink);
    dropdownContent.appendChild(addDepartmentsLink);
  }
  dropdownContent.appendChild(coursesByDepartmentLink);
  dropdownContent.insertBefore(logoutButton, null);
  document.body.insertBefore(newHeader, profileSection);

  headerGenerated = true;

  const searchBar = document.createElement("input");
  searchBar.type = "text";
  searchBar.id = "search-bar";
  searchBar.placeholder = "Search";
  newHeader.appendChild(searchBar);

  const searchButton = document.createElement("button");
  searchButton.className = "btn btn-primary";
  const searchIcon = document.createElement("span");
  searchIcon.className = "bi bi-search";
  searchButton.appendChild(searchIcon);
  newHeader.appendChild(searchButton);

  searchButton.addEventListener("click", handleSearch);
  searchBar.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  hamburgerButton.addEventListener("click", () => {
    dropdownContent.style.display =
      dropdownContent.style.display === "none" ? "block" : "none";
  });

  async function handleProfileLinkClick() {
    document.getElementById("account-section").style.display = "none";
    document.getElementById("search-section").style.display = "none";
    const courseList = document.getElementById("course-list");
    if (courseList) {
      courseList.style.display = "none";
    }

    const departmentAllCourses = document.getElementById(
      "courses-by-department-section"
    );
    if (departmentAllCourses) {
      departmentAllCourses.style.display = "none";
    }

    const addCourse = document.getElementById("add-course-section");
    if (addCourse) {
      addCourse.style.display = "none";
    }

    const searchSection = document.getElementById("search-section");
    if (searchSection) {
      searchSection.style.display = "none";
    }

    const addDepartment = document.getElementById("add-department-section");
    if (addDepartment) {
      addDepartment.style.display = "none";
    }

    profileSection.style.display = "block";
    dropdownContent.style.display = "none";
  }

  async function handleAddCourseLinkClick() {
    document.getElementById("add-course-section").style.display = "block";

    profileSection.style.display = "none";

    const searchSection = document.getElementById("search-section");
    if (searchSection) {
      searchSection.style.display = "none";
    }
    const departmentAllCourses = document.getElementById(
      "courses-by-department-section"
    );
    if (departmentAllCourses) {
      departmentAllCourses.style.display = "none";
    }
    const courseList = document.getElementById("course-list");
    if (courseList) {
      courseList.style.display = "none";
    }
    const accountSec = document.getElementById("account-section");
    if (accountSec) {
      accountSec.style.display = "none";
    }
    const addDepartment = document.getElementById("add-department-section");
    if (addDepartment) {
      addDepartment.style.display = "none";
    }
    dropdownContent.style.display = "none";
    fetchDepartments();
  }

  async function handleCoursesByDepartmentLinkClick() {
    document.getElementById("profile-section").style.display = "none";
    const searchSection = document.getElementById("search-section");
    if (searchSection) {
      searchSection.style.display = "none";
    }
    const courseList = document.getElementById("course-list");
    if (courseList) {
      courseList.style.display = "none";
    }
    const accountSec = document.getElementById("account-section");
    if (accountSec) {
      accountSec.style.display = "none";
    }

    const addCourseSec = document.getElementById("add-course-section");
    if (addCourseSec) {
      addCourseSec.style.display = "none";
    }
    const addDepartment = document.getElementById("add-department-section");
    if (addDepartment) {
      addDepartment.style.display = "none";
    }
    dropdownContent.style.display = "none";

    document.getElementById("courses-by-department-section").style.display =
      "block";

    displayCoursesByDepartment();
  }

  async function handleAddDepartmentLinkClick() {
    document.getElementById("add-department-section").style.display = "block";

    profileSection.style.display = "none";
    const searchSection = document.getElementById("search-section");
    if (searchSection) {
      searchSection.style.display = "none";
    }
    const addCourse = document.getElementById("add-course-section");
    if (addCourse) {
      addCourse.style.display = "none";
    }
    const courseList = document.getElementById("course-list");
    if (courseList) {
      courseList.style.display = "none";
    }

    const departmentAllCourses = document.getElementById(
      "courses-by-department-section"
    );
    if (departmentAllCourses) {
      departmentAllCourses.style.display = "none";
    }
    const accountSec = document.getElementById("account-section");
    if (accountSec) {
      accountSec.style.display = "none";
    }
    dropdownContent.style.display = "none";
  }

  document
    .getElementById("add-course-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);

      const selectedDepartment = document.querySelector(
        'input[name="departments"]:checked'
      ).value;

      const courseDetails = {
        name: formData.get("name"),
        description: formData.get("description"),
        link: formData.get("link"),
        keySkills: formData
          .get("keySkills")
          .split(",")
          .map((skill) => skill.trim()),
        duration: parseInt(formData.get("duration"), 10),
        department: selectedDepartment,
      };

      try {
        const response = await fetch("http://localhost:3000/course/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseDetails),
        });

        if (response.ok) {
          const newCourse = await response.json();

          alert("Course added successfully!");
          event.target.reset();
        } else {
          const errorMessage = await response.text();
          throw new Error(
            errorMessage || "An error occurred while adding the course"
          );
        }
      } catch (error) {
        alert(error.message);
      }
    });

  document
    .getElementById("add-department-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);

      const departmentDetails = {
        name: formData.get("name"),
        description: formData.get("description"),
      };

      try {
        const response = await fetch(
          "http://localhost:3000/department/add-department",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(departmentDetails),
          }
        );

        if (response.ok) {
          const newDepartment = await response.json();

          alert("Department added successfully!");
          event.target.reset();
        } else {
          const errorMessage = await response.text();
          throw new Error(
            errorMessage || "An error occurred while adding the department"
          );
        }
      } catch (error) {
        alert(error.message);
      }
    });

  async function handleAccountLinkClick() {
    const courseList = document.getElementById("course-list");
    if (courseList) {
      courseList.style.display = "none";
    }
    const departmentAllCourses = document.getElementById(
      "courses-by-department-section"
    );
    if (departmentAllCourses) {
      departmentAllCourses.style.display = "none";
    }

    const searchSec = document.getElementById("search-section");
    if (searchSec) {
      searchSec.style.display = "none";
    }

    const addCourse = document.getElementById("add-course-section");
    if (addCourse) {
      addCourse.style.display = "none";
    }

    const addDepartment = document.getElementById("add-department-section");
    if (addDepartment) {
      addDepartment.style.display = "none";
    }
    const response = await fetch("http://localhost:3000/user/user/account", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (response.ok) {
      const userDetails = await response.json();
      dropdownContent.style.display = "none";

      const accountSection = document.getElementById("account-section");
      accountSection.innerHTML = "";
      const profileImg = document.createElement("img");
      profileImg.className = "profile-img-account";
      profileImg.src = userDetails.profilePicture;
      accountSection.appendChild(profileImg);

      const userName = document.createElement("h2");
      userName.textContent = userDetails.name;
      userName.classList.add("center-text");
      accountSection.appendChild(userName);

      const imageInput = document.createElement("input");
      imageInput.type = "file";
      imageInput.id = "image-input";
      imageInput.accept = "image/*";
      accountSection.appendChild(imageInput);

      imageInput.addEventListener("change", function (e) {
        const file = e.target.files[0];

        const formData = new FormData();

        formData.append("image", file);

        uploadImage(formData);
      });

      async function uploadImage(formData) {
        const response = await fetch("http://localhost:3000/upload", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => {
            console.error("Error:", error);
          });
      }

      // document.getElementById("account-profile-pic").src =
      //   userDetails.profilePicture;
      // document.getElementById("account-name").textContent = userDetails.name;
      // document.getElementById("account-department").textContent =
      //   userDetails.department;

      loginSection.style.display = "none";
      registerSection.style.display = "none";
      mainLogin.style.display = "none";
      profileSection.style.display = "none";
      document.getElementById("search-section").style.display = "none";
      document.getElementById("account-section").style.display = "block";
    } else {
      const errorData = await response.json();
      document.getElementById("errorMessage").textContent = errorData.message;
      modal.style.display = "block";
    }
  }

  async function handleCoursesLinkClick() {
    const accountSection = document.getElementById("account-section");
    if (accountSection) {
      accountSection.style.display = "none";
    }
    const courseList = document.getElementById("course-list");
    if (courseList) {
      courseList.style.display = "block";
    }
    const addCourse = document.getElementById("add-course-section");
    if (addCourse) {
      addCourse.style.display = "none";
    }
    const departmentAllCourses = document.getElementById(
      "courses-by-department-section"
    );
    if (departmentAllCourses) {
      departmentAllCourses.style.display = "none";
    }

    const addDepartment = document.getElementById("add-department-section");
    if (addDepartment) {
      addDepartment.style.display = "none";
    }
    try {
      const response = await fetch("http://localhost:3000/course/courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.ok) {
        const courses = await response.json();
        dropdownContent.style.display = "none";
        loginSection.style.display = "none";
        registerSection.style.display = "none";
        mainLogin.style.display = "none";
        profileSection.style.display = "none";
        document.getElementById("search-section").style.display = "none";
        displayCourses(courses);
      } else {
        const errorData = await response.json();
        document.getElementById("errorMessage").textContent = errorData.message;
        modal.style.display = "block";
      }
    } catch (error) {
      console.error("Error while fetching courses: ", error);
    }
  }

  async function handleLogoutClick() {
    dropdownContent.style.display = "none";
    try {
      const response = await fetch("http://localhost:3000/user/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        document.getElementById("errorMessage").textContent = errorData.message;
        modal.style.display = "block";
      }
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  async function handleSearch() {
    const searchQuery = searchBar.value;
    if (searchQuery.trim() !== "") {
      const response = await fetch(
        `http://localhost:3000/search?q=${searchQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer" + localStorage.getItem("token"),
          },
        }
      );
      if (response.ok) {
        const courses = await response.json();
        localStorage.setItem("section", "search");
        localStorage.setItem("searchQuery", searchQuery);
        displaySearchResults(courses);
        document.getElementById("profile-section").style.display = "none";
        const addCourse = document.getElementById("add-course-section");
        if (addCourse) {
          addCourse.style.display = "none";
        }
        const accountSection = document.getElementById("account-section");
        if (accountSection) {
          accountSection.style.display = "none";
        }
        const addDepartment = document.getElementById("add-department-section");
        if (addDepartment) {
          addDepartment.style.display = "none";
        }

        const departmentAllCourses = document.getElementById(
          "courses-by-department-section"
        );
        if (departmentAllCourses) {
          departmentAllCourses.style.display = "none";
        }
        document.getElementById("search-section").style.display = "block";
        const courseList = document.getElementById("course-list");
        if (courseList) {
          courseList.style.display = "none";
        }

        searchBar.value = "";
      } else {
        const errorData = await response.json();
        document.getElementById("errorMessage").textContent = errorData.message;
        modal.style.display = "block";
      }
    }
  }
}

//this below is before i changed it for admins.

// I left these to differentiate from my copy: non-functional code:
// let userProfileHeader = null; // Declare variable at a higher scope
// let dropdownContent = null;

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://localhost:3000/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const { user, token } = await response.json();
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      generateUserProfile(user);
      fetchAndDisplayCourses();
    } else {
      const errorData = await response.json();
      document.getElementById("errorMessage").textContent = errorData.message;
      modal.style.display = "block";
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const name = document.getElementById("register-name").value;

    const response = await fetch("http://localhost:3000/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      const { user, token } = await response.json();
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem(
        "registrationSuccessful",
        "Registration successful! Please log in."
      );

      displayRegistrationMessage();

      loginSection.style.display = "block";
      registerSection.style.display = "none";
      divider.style.display = "none";
    } else {
      const errorData = await response.json();
      document.getElementById("errorMessage").textContent = errorData.message;
      modal.style.display = "block";
    }
  });
} else {
  console.error("No Registration Form exists");
}

document.querySelector(".close").addEventListener("click", () => {
  modal.style.display = "none";
});
