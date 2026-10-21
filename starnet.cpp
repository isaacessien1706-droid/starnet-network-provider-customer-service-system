#include <iostream>
#include <string>
#include <iomanip>

using namespace std;

// Average service duration per subscriber at a Starnet counter (in minutes)
const int AVG_MINS_PER_TICKET = 4;

// Dynamic Node representing a single subscriber in the Starnet Queue
struct StarnetNode {
    string ticketCode;      // e.g., PAY-101, SIM-102, FIB-103
    string customerName;    // Subscriber's full name
    string phoneNumber;     // Starnet Phone Number (MSISDN)
    string serviceName;     // Requested telecom service
    int assignedCounter;    // Target Counter #
    StarnetNode* next;      // Pointer to the next subscriber in line
};

class StarnetQueue {
private:
    StarnetNode* head;      // Pointer to Front of queue (Dequeue point)
    StarnetNode* tail;      // Pointer to Rear of queue (Enqueue point)
    int currentSize;        // Dynamic count of waiting subscribers
    int nextSequenceNum;    // Auto-incrementing ticket number starting at 101
    int totalServedToday;   // Total subscribers served during session

public:
    // Constructor initializes an empty dynamic queue
    StarnetQueue() {
        head = nullptr;
        tail = nullptr;
        currentSize = 0;
        nextSequenceNum = 101;
        totalServedToday = 0;
    }

    // Destructor frees all dynamically allocated nodes on exit
    ~StarnetQueue() {
        while (!isEmpty()) {
            StarnetNode* temp = head;
            head = head->next;
            delete temp;
        }
    }

    // Check if queue is empty — O(1)
    bool isEmpty() const {
        return head == nullptr;
    }

    // ENQUEUE: Dynamically allocate and attach a new subscriber at Tail — O(1)
    void enqueueSubscriber(const string& name, const string& phone, int categoryChoice, bool quietMode = false) {
        string prefix, serviceDesc;
        int counterNo;

        switch (categoryChoice) {
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
            default:
                prefix = "GEN-";
                serviceDesc = "General Enquiry & Postpaid Billing";
                counterNo = 4;
                break;
        }

        // Dynamically allocate a new node in heap memory
        StarnetNode* newNode = new StarnetNode;
        newNode->ticketCode = prefix + to_string(nextSequenceNum++);
        newNode->customerName = name;
        newNode->phoneNumber = phone;
        newNode->serviceName = serviceDesc;
        newNode->assignedCounter = counterNo;
        newNode->next = nullptr;

        int estWaitMins = currentSize * AVG_MINS_PER_TICKET;

        // Link node into the FIFO queue
        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail->next = newNode;
            tail = newNode;
        }

        currentSize++;

        if (!quietMode) {
            cout << "\n+------------------------------------------------------+\n";
            cout << "|       STARNET TELECOM CUSTOMER CARE CENTER           |\n";
            cout << "|         Connecting You Everywhere You Go             |\n";
            cout << "+------------------------------------------------------+\n";
            cout << "  TICKET NUMBER   : " << newNode->ticketCode << "\n";
            cout << "  SUBSCRIBER      : " << name << " (" << phone << ")\n";
            cout << "  SERVICE         : " << serviceDesc << "\n";
            cout << "  ASSIGNED TO     : Counter #" << counterNo << "\n";
            cout << "  QUEUE POSITION  : #" << currentSize << " in waiting line\n";
            cout << "  EST. WAIT TIME  : ~" << estWaitMins << " mins\n";
            cout << "+------------------------------------------------------+\n";
        }
    }

    // DEQUEUE: Serve and free the subscriber at the Head of the queue — O(1)
    void dequeueSubscriber() {
        if (isEmpty()) {
            cout << "\n[STANDBY] Starnet Lounge Queue is empty! All counters idle.\n";
            return;
        }

        StarnetNode* servedNode = head;

        cout << "\n==========================================================\n";
        cout << " [AUDIO CALL] \"Ticket " << servedNode->ticketCode
             << ", please proceed to Counter #" << servedNode->assignedCounter << "\"\n";
        cout << "----------------------------------------------------------\n";
        cout << " Subscriber : " << servedNode->customerName << " (" << servedNode->phoneNumber << ")\n";
        cout << " Service    : " << servedNode->serviceName << "\n";
        cout << "==========================================================\n";

        // Advance Head pointer to the next subscriber in line
        head = head->next;
        if (head == nullptr) {
            tail = nullptr; // Queue is now completely empty
        }

        // Free heap memory for the served subscriber
        delete servedNode;

        currentSize--;
        totalServedToday++;

        cout << "Queue Update: " << currentSize << " waiting | "
             << totalServedToday << " served today.\n";
    }

    // PEEK: Inspect the subscriber currently at the Head — O(1)
    void peekHead() const {
        if (isEmpty()) {
            cout << "\n[INFO] No subscribers waiting at the Head of the queue.\n";
            return;
        }
        cout << "\n[NEXT TO BE SERVED] " << head->ticketCode << " - "
             << head->customerName << " (" << head->serviceName
             << ") -> Counter #" << head->assignedCounter << "\n";
    }

    // DISPLAY: Dynamically traverse pointers from Head to Tail — O(n)
    void displayLiveBoard() const {
        if (isEmpty()) {
            cout << "\n[LIVE TV BOARD] Starnet waiting lounge is currently empty.\n";
            return;
        }

        cout << "\n======================= STARNET TELECOM LIVE QUEUE DISPLAY =======================\n";
        cout << left << setw(10) << "Pos"
             << setw(11) << "Ticket"
             << setw(20) << "Subscriber"
             << setw(14) << "Starnet No."
             << setw(11) << "Est. Wait"
             << "Counter & Service\n";
        cout << string(96, '-') << "\n";

        StarnetNode* current = head;
        int pos = 1;

        while (current != nullptr) {
            string posLabel = to_string(pos);
            if (current == head) posLabel += " (Head)";
            else if (current == tail) posLabel += " (Tail)";

            int waitTime = (pos - 1) * AVG_MINS_PER_TICKET;
            string waitLabel = to_string(waitTime) + " mins";

            cout << left << setw(10) << posLabel
                 << setw(11) << current->ticketCode
                 << setw(20) << current->customerName
                 << setw(14) << current->phoneNumber
                 << setw(11) << waitLabel
                 << "[C#" << current->assignedCounter << "] " << current->serviceName << "\n";

            current = current->next;
            pos++;
        }
        cout << string(96, '-') << "\n";
        cout << "Waiting (Heap Nodes): " << currentSize << " | Served Today: " << totalServedToday << "\n";
    }

    // DEMO LOADER: Quickly populate sample Starnet subscribers
    void loadSampleRushHour() {
        enqueueSubscriber("Nana Kwesi Appiah", "027 458 9120", 1, true);
        enqueueSubscriber("Abena Mansa", "057 781 2390", 2, true);
        enqueueSubscriber("Kofi Boateng", "027 334 4556", 3, true);
        cout << "\n[DEMO LOADED] 3 sample Starnet subscribers added to the dynamic queue!\n";
        displayLiveBoard();
    }
};

int main() {
    StarnetQueue starnetBranch;
    int choice, category;
    string name, phone;

    do {
        cout << "\n=== STARNET TELECOM CUSTOMER CARE e-QMS ===\n";
        cout << "1. Issue New Ticket (Dynamic Enqueue at Tail)\n";
        cout << "2. Call Next Subscriber (Dynamic Dequeue from Head)\n";
        cout << "3. Peek Next Subscriber at Head\n";
        cout << "4. View Live Lounge Display Board\n";
        cout << "5. [Quick Demo] Auto-Load 3 Sample Subscribers\n";
        cout << "0. Exit Program\n";
        cout << "Select option: ";

        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(1000, '\n');
            cout << "\n[ERROR] Please enter a valid number (0-5).\n";
            continue;
        }
        cin.ignore();

        switch (choice) {
            case 1:
                cout << "Enter Subscriber Full Name: ";
                getline(cin, name);
                cout << "Enter Starnet Phone Number: ";
                getline(cin, phone);
                cout << "\nSelect Starnet Service Category:\n";
                cout << "  1. StarPay Mobile Money (Reversal / PIN Reset)\n";
                cout << "  2. SIM Swap, eSIM & Ghana Card Linking\n";
                cout << "  3. StarFibre 5G & Router Broadband\n";
                cout << "  4. General Enquiries & Postpaid Billing\n";
                cout << "Enter category (1-4): ";
                if (!(cin >> category)) {
                    cin.clear();
                    cin.ignore(1000, '\n');
                    category = 4;
                }
                starnetBranch.enqueueSubscriber(name, phone, category);
                break;
            case 2:
                starnetBranch.dequeueSubscriber();
                break;
            case 3:
                starnetBranch.peekHead();
                break;
            case 4:
                starnetBranch.displayLiveBoard();
                break;
            case 5:
                starnetBranch.loadSampleRushHour();
                break;
            case 0:
                cout << "\nFreeing dynamic heap memory and closing Starnet terminal. Goodbye!\n";
                break;
            default:
                cout << "\n[ERROR] Choose an option between 0 and 5.\n";
        }
    } while (choice != 0);

    return 0;
}