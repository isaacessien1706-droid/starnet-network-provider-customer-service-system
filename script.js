const AVG_MINS_PER_TICKET = 4;

// 1. Node Class representing a single Starnet Subscriber in Heap Memory
class StarnetQueueNode {
  constructor(ticketCode, customerName, phoneNumber, serviceName, assignedCounter) {
    this.ticketCode = ticketCode;
    this.customerName = customerName;
    this.phoneNumber = phoneNumber;
    this.serviceName = serviceName;
    this.assignedCounter = assignedCounter;
    this.next = null; // Pointer to the next node in the queue
  }
}

// 2. Dynamic Linked-List Queue Class (FIFO)
class StarnetLinkedQueue {
  constructor() {
    this.head = null; // Front pointer (Dequeue point)
    this.tail = null; // Rear pointer (Enqueue point)
    this.size = 0;
    this.nextSequence = 101;
    this.totalServedToday = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  // ENQUEUE: O(1) insertion at the Tail pointer
  enqueue(name, phone, categoryChoice) {
    let prefix = "GEN-";
    let serviceDesc = "General Enquiry & Postpaid Billing";
    let counterNo = 4;

    switch (parseInt(categoryChoice, 10)) {
      case 1:
        prefix = "PAY-";
        serviceDesc = "StarPay Mobile Money Reversal & PIN Reset";
        counterNo = 1;
        break;
      case 2:
        prefix = "SIM-";
        serviceDesc = "SIM Swap, eSIM & Ghana Card Linking";
        counterNo = 2;
        break;
      case 3:
        prefix = "FIB-";
        serviceDesc = "StarFibre 5G & Router Broadband";
        counterNo = 3;
        break;
    }

    const ticketCode = prefix + this.nextSequence++;
    const newNode = new StarnetQueueNode(ticketCode, name, phone, serviceDesc, counterNo);

    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    return newNode;
  }

  // DEQUEUE: O(1) removal from the Head pointer
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    const servedNode = this.head;
    this.head = this.head.next;

    if (this.head === null) {
      this.tail = null;
    }

    this.size--;
    this.totalServedToday++;
    return servedNode;
  }

  // PEEK: O(1) inspection of the Head pointer
  peek() {
    return this.head;
  }

  // Convert linked nodes to array for UI rendering: O(n)
  toArray() {
    const result = [];
    let current = this.head;
    while (current !== null) {
      result.push(current);
      current = current.next;
    }
    return result;
  }
}

// Initialize the Starnet Branch Queue instance
const starnetQueue = new StarnetLinkedQueue();

// Handle Form Submission (Enqueue)
function handleIssueTicket(event) {
  event.preventDefault();
  const nameInput = document.getElementById("subName");
  const phoneInput = document.getElementById("subPhone");
  const serviceInput = document.getElementById("subService");

  const newNode = starnetQueue.enqueue(
    nameInput.value.trim(),
    phoneInput.value.trim(),
    serviceInput.value
  );

  const estWait = (starnetQueue.size - 1) * AVG_MINS_PER_TICKET;

  // Populate Thermal Receipt Preview
  document.getElementById("receiptBox").style.display = "block";
  document.getElementById("receiptTicketNo").textContent = newNode.ticketCode;
  document.getElementById("recName").textContent = newNode.customerName;
  document.getElementById("recPhone").textContent = newNode.phoneNumber;
  document.getElementById("recService").textContent = newNode.serviceName;
  document.getElementById("recCounter").textContent = "Counter #" + newNode.assignedCounter;
  document.getElementById("recPos").textContent = "#" + starnetQueue.size + " in line";
  document.getElementById("recWait").textContent = "~" + estWait + " mins";

  showToast("Enqueued Ticket " + newNode.ticketCode + " at the Tail of the Starnet queue.");

  nameInput.value = "";
  phoneInput.value = "";
  renderQueueUI();
}

// Handle Agent Call Next Subscriber (Dequeue)
function handleDequeue() {
  const served = starnetQueue.dequeue();
  const screen = document.getElementById("servingScreen");

  if (!served) {
    showToast("Starnet Queue is currently empty! No subscribers waiting at the Head.");
    return;
  }

  // Update Now Serving Banner
  document.getElementById("servingTicket").textContent = served.ticketCode;
  document.getElementById("servingDetails").textContent =
    served.customerName + " (" + served.phoneNumber + ") — " + served.serviceName;
  document.getElementById("servingCounterBadge").textContent =
    "Proceed to Counter #" + served.assignedCounter;

  // Trigger pulse animation
  screen.classList.remove("active-call");
  void screen.offsetWidth;
  screen.classList.add("active-call");

  // Web Speech API Voice Announcement
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      "Starnet Ticket " + served.ticketCode.replace("-", " ") +
      ", " + served.customerName +
      ", please proceed to Counter number " + served.assignedCounter
    );
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  showToast("Dequeued " + served.ticketCode + " from the Head of the Starnet queue.");
  renderQueueUI();
}

// Handle Peek Operation
function handlePeek() {
  const nextUp = starnetQueue.peek();
  if (!nextUp) {
    showToast("Peek Result: Queue is empty (Head == NULL).");
  } else {
    showToast(
      "PEEK HEAD: " + nextUp.ticketCode + " | " +
      nextUp.customerName + " (" + nextUp.serviceName + ") -> Counter #" +
      nextUp.assignedCounter
    );
  }
}

// Quick Demo Loader
function loadSampleRushHour() {
  const sampleSubscribers = [
    { name: "Nana Kwesi Appiah", phone: "027 458 9120", cat: 1 },
    { name: "Abena Mansa", phone: "057 781 2390", cat: 2 },
    { name: "Kofi Boateng", phone: "027 334 4556", cat: 3 }
  ];

  sampleSubscribers.forEach((sub) => {
    starnetQueue.enqueue(sub.name, sub.phone, sub.cat);
  });

  showToast("Loaded 3 sample Starnet subscribers into the dynamic queue!");
  renderQueueUI();
}

// Show status message
function showToast(message) {
  const toast = document.getElementById("statusToast");
  toast.style.display = "block";
  toast.textContent = message;
}

// Render Linked-List Visualizer, TV Table, and Top Metrics
function renderQueueUI() {
  const nodes = starnetQueue.toArray();

  // 1. Update Top Bar Metrics
  document.getElementById("statWaiting").textContent = starnetQueue.size;
  document.getElementById("statWaitTime").textContent =
    (starnetQueue.size * AVG_MINS_PER_TICKET) + " mins";
  document.getElementById("statServed").textContent = starnetQueue.totalServedToday;

  // 2. Render Linked-List Pointer Visualizer
  const visualizer = document.getElementById("dsVisualizer");
  visualizer.innerHTML = "";

  if (nodes.length === 0) {
    visualizer.innerHTML =
      '<div class="ds-null">HEAD == NULL &nbsp;|&nbsp; TAIL == NULL (Empty Starnet Queue)</div>';
  } else {
    nodes.forEach((node, index) => {
      const nodeEl = document.createElement("div");
      nodeEl.className = "ds-node";

      let badgesHTML = "";
      if (index === 0 && index === nodes.length - 1) {
        badgesHTML = '<span class="ds-pointer-badge head-badge">HEAD & TAIL</span>';
      } else if (index === 0) {
        badgesHTML = '<span class="ds-pointer-badge head-badge">HEAD</span>';
      } else if (index === nodes.length - 1) {
        badgesHTML = '<span class="ds-pointer-badge">TAIL</span>';
      }

      const nextLabel = node.next ? node.next.ticketCode : "NULL";

      nodeEl.innerHTML =
        badgesHTML +
        '<div class="ds-node-code">' + node.ticketCode + '</div>' +
        '<div class="ds-node-name">' + node.customerName + '</div>' +
        '<div class="ds-node-next">next: ' + nextLabel + '</div>';

      visualizer.appendChild(nodeEl);

      const arrowEl = document.createElement("div");
      arrowEl.className = "ds-arrow";
      arrowEl.textContent = "→";
      visualizer.appendChild(arrowEl);
    });

    const nullEl = document.createElement("div");
    nullEl.className = "ds-null";
    nullEl.textContent = "NULL";
    visualizer.appendChild(nullEl);
  }

  // 3. Render Live Lounge TV Table
  const tbody = document.getElementById("queueTableBody");
  tbody.innerHTML = "";

  if (nodes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding: 24px;">' +
      'No subscribers currently waiting in the Starnet Lounge Queue.' +
      '</td></tr>';
  } else {
    nodes.forEach((node, idx) => {
      const tr = document.createElement("tr");

      let posTag = "#" + (idx + 1);
      let badgeClass = "pos-badge";
      if (idx === 0) {
        posTag += " (HEAD)";
        badgeClass += " pos-head";
      } else if (idx === nodes.length - 1) {
        posTag += " (TAIL)";
        badgeClass += " pos-tail";
      }

      const waitMins = idx * AVG_MINS_PER_TICKET;

      tr.innerHTML =
        '<td><span class="' + badgeClass + '">' + posTag + '</span></td>' +
        '<td><strong style="color:var(--star-cyan)">' + node.ticketCode + '</strong></td>' +
        '<td>' + node.customerName + '</td>' +
        '<td>' + node.phoneNumber + '</td>' +
        '<td>Counter #' + node.assignedCounter + '</td>' +
        '<td>' + node.serviceName + '</td>' +
        '<td>~' + waitMins + ' mins</td>';

      tbody.appendChild(tr);
    });
  }
}

// Initial render on page load
renderQueueUI();