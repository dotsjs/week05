const view = [...document.querySelectorAll(".status")];
const rightView = view.filter((_, index) => index % 2);
const leftView = view.filter((_, index) => index % 2 == 0);

const door = [...document.querySelectorAll(".door")];
const rightDoor = door.filter((_, index) => index % 2).reverse();
const leftDoor = door.filter((_, index) => index % 2 == 0).reverse();

const setDoor = door => (prev, now) => {
  door[prev].classList.remove("active-door");
  door[now].classList.add("active-door");
};

const setView = view => {
  const setText = value => {
    view.forEach(v => {
      v.textContent = value;
    });
  };
  return floor => {
    setText(floor);
  };
};

const setElevator = left_right => elevator => func =>
  (Elevators[left_right] = func(elevator));

const getStatus = (now, to) => (to > now ? "up" : "down");
const updown = (now, to) => (to > now ? 1 : -1);
const getFloor = floor => (floor === 0 ? "B1" : floor);
const setStatus = status => elevator => ({ ...elevator, status });
const setFloor = floor => elevator => ({ ...elevator, floor });
const addCheckList = check => elevator => ({
  ...elevator,
  checkList: [...checkList, check]
});
const lookupCheckList = floor => checkList =>
  checkList.filter(check =>
    check.floor === floor ? removeCheck(check.current, check.to) : true
  );
const removeCheck = (current, to) => current.classList.remove(`active-${to}`);
const setOrderQueue = orderQueue => elevator => ({ ...elevator, orderQueue });
const addOrder = order => elevator => ({
  ...elevator,
  orderQueue: [...orderQueue, order]
});

const moveTo = (current, elevator, floor, to) => {
  if (elevator.floor === floor) {
    elevator.status = "stop";
    current.classList.remove(`active-${to}`);
    elevator.orderQueue.forEach(order => {
      setTimeout(() => {
        order.func(order.current, elevator, order.floor);
      });
    });
    elevator.orderQueue = [];
    return;
  }
  elevator.checkList = elevator.checkList.filter(check => {
    if (check.floor === elevator.floor) {
      check.current.classList.remove(`active-${to}`);
      return false;
    }
    return true;
  });

  elevator.status = getStatus(elevator.floor, floor);
  setTimeout(() => {
    const next = elevator.floor + updown(elevator.floor, floor);
    elevator.setDoor(elevator.floor, next);
    elevator.floor = next;
    elevator.setView(getFloor(elevator.floor));
    moveTo(current, elevator, floor, to);
  }, 1000);
};

const up = (current, elevator, floor) => {
  if (elevator.status === "stop") {
    moveTo(current, elevator, floor, "up");
  } else {
    if (elevator.status === "up" && elevator.floor < floor) {
      elevator.checkList.push({ current, floor, to });
    } else {
      elevator.orderQueue.push({ func: up, floor, current });
    }
  }
};

const down = (current, elevator, floor) => {
  if (elevator.status === "stop") {
    moveTo(current, elevator, floor, "down");
  } else {
    if (elevator.status === "down" && elevator.floor < floor) {
      elevator.checkList.push({ current, floor });
    } else {
      elevator.orderQueue.push({ func: down, floor, current });
    }
  }
};

const Elevators = {
  left: {
    floor: 0,
    orderQueue: [],
    checkList: [],
    setView: setView(leftView),
    setDoor: setDoor(leftDoor),
    status: "stop"
  },
  right: {
    floor: 0,
    orderQueue: [],
    checkList: [],
    setView: setView(rightView),
    setDoor: setDoor(rightDoor),
    status: "stop"
  }
};

Elevators.left.setView("B1");
Elevators.right.setView("B1");
Elevators.left.setDoor(0, 0);
Elevators.right.setDoor(0, 0);
const floors = [...document.querySelectorAll(".floor")];

floors.forEach((floor, index) => {
  floor.addEventListener("click", e => {
    const current = e.target;
    const elevator = current.parentElement.parentElement.className;
    switch (true) {
      case current.classList.contains("up"):
        if (!current.classList.contains("active-up")) {
          current.classList.add("active-up");
          up(current, Elevators[elevator], 6 - index);
        }
        break;
      case current.classList.contains("down"):
        if (!current.classList.contains("active-down")) {
          current.classList.add("active-down");
          down(current, Elevators[elevator], 6 - index);
        }
        break;
      default:
        break;
    }
  });
});
