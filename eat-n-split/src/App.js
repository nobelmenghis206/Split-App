import { useState } from "react";

// Initial data for the friends list
const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

// Button component for reusability
function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

// The main App component
export default function App() {
  // State variables for managing friends list, add friend form, and selected friend
  const [friends, setFriends] = useState(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Toggle the display of the "Add friend" form
  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  // Add a new friend to the list
  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  // Handle selecting/deselecting a friend
  function handleSelection(friend) {
    setSelectedFriend((cur) => (cur?.id === friend.id ? null : friend));
    setShowAddFriend(false);
  }

  // Handle splitting a bill with the selected friend
  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );

    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        {/* Display the list of friends */}
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection}
        />

        {/* Display the "Add friend" form if showAddFriend is true */}
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}

        {/* Toggle button to show/hide the "Add friend" form */}
        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add friend"}
        </Button>
      </div>

      {/* Display the bill splitting form if a friend is selected */}
      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
          key={selectedFriend.id}
        />
      )}
    </div>
  );
}

// FriendsList component to display the list of friends
function FriendsList({ friends, onSelection, selectedFriend }) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          key={friend.id}
          selectedFriend={selectedFriend}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}

// Friend component to display individual friend details
function Friend({ friend, onSelection, selectedFriend }) {
  const isSelected = selectedFriend?.id === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {/* Display different messages based on the friend's balance */}
      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} ${Math.abs(friend.balance)}
        </p>
      )}
      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you ${Math.abs(friend.balance)}
        </p>
      )}
      {friend.balance === 0 && <p>You and {friend.name} are even</p>}

      {/* Button to select/deselect the friend */}
      <Button onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

// FormAddFriend component to add a new friend
function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  // Handle form submission to add a new friend
  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !image) return;

    // Generate a unique ID and create a new friend object
    const id = crypto.randomUUID();
    const newFriend = {
      id,
      name,
      image: `${image}?=${id}`,
      balance: 0,
    };

    // Call the onAddFriend function to add the new friend
    onAddFriend(newFriend);

    // Reset form fields
    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👫 Friend name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>🌄 Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      {/* Button to add the friend */}
      <Button>Add</Button>
    </form>
  );
}
function FormSplitBill({ selectedFriend, onSplitBill }) {
  // State variables for bill amount, user's payment, and who is paying
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");

  // Calculate the portion paid by the friend (bill - user's payment)
  const paidByFriend = bill ? bill - paidByUser : "";

  // Default to user paying the bill
  const [whoIsPaying, setWhoIsPaying] = useState("user");

  // Handle form submission when splitting the bill
  function handleSubmit(e) {
    e.preventDefault();

    // Check if the bill amount and user's payment are both provided
    if (!bill || !paidByUser) return;

    // Calculate the portion to be settled based on who is paying
    const amountToSettle = whoIsPaying === "user" ? paidByFriend : -paidByUser;

    // Call the onSplitBill function with the calculated amount
    onSplitBill(amountToSettle);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      {/* Display the name of the selected friend */}
      <h2>Split a bill with {selectedFriend.name}</h2>

      {/* Input for entering the total bill amount */}
      <label>💰 Bill value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      />

      {/* Input for entering the user's payment */}
      <label>🧍‍♀️ Your expense</label>
      <input
        type="text"
        value={paidByUser}
        onChange={(e) =>
          setPaidByUser(
            // Ensure user's payment doesn't exceed the total bill
            Number(e.target.value) > bill ? paidByUser : Number(e.target.value)
          )
        }
      />

      {/* Display the friend's portion (calculated) */}
      <label>👫 {selectedFriend.name}'s expense</label>
      <input type="text" disabled value={paidByFriend} />

      {/* Select who is paying the bill (user or friend) */}
      <label>🤑 Who is paying the bill</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>

      {/* Button to submit and split the bill */}
      <Button>Split bill</Button>
    </form>
  );
}
