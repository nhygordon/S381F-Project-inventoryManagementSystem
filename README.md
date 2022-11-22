# S381F-Project-inventoryManagementSystem
| Name | Sid |
| ------------- | ------------- |
| Ng Hoi Yun    |   12501983    |
| Fung Long     |   12534500    |
| Chak Chun Yin |   12561494    |


This is a book inventory. There are six functions on our website.

Function
1.	Login: We will set up a unique account for every user. Each user has a username and password.
Logout: After user Login to the home page, they can Logout anytime

2.	Home page : 
    Logout button 
    create book button
            1.  book name
            2.  ISBN
            3. quantity
            4. publisher
            5. brief synopsis
    search bar
    book inventory
            1. book name
            2. ISBN
            3. quantity
            4. publisher
            5. brief synopsis
        name is mandatory; other attributes are optional


3.	Update Book Data
After clicking the Book name(go to the detail page) and clicking “Edit”, only the creator can update the book data.

4.	Delete Book Data
After clicking the Book name(go to the detail page) and clicking “Delete”, only the creator can delete the book data.

5.  Search for the Books 
Enters the book name to search for the books.

6.  Provide the following RESTful services.
            Request                     Parameters                       Response
    get(/api/library/name/:name')        /name/xxx              [{"_id":".....","name":"...}]
    delete('/api/library/Isbn/:Isbn')    /Isbn/xxx              no response, it will be deleted


_________________________________________________________________________________________________________
The server can pass different test cases. Here is a sample test case.

Precondition:
    An empty collection

Steps:
    Login as fl (password: fl)
    Create a Book data with name = xxx
    Use get(/api/library/name/xxx') to read data

Expected outcome:
    The data of xxx will shown in JSON format.