//This is a data module and this is helping out in data encapsulation.
var budgetController = (function(){
    //Create an Income Object
      var Income = function(id,description,values){
        this.id = id;
        this.description = description;
        this.values = values;
      };

  //Create one expense object
      var Expense = function(id,description,values){
        this.id = id;
        this.description = description;
        this.values = values;
        this.percentage = -1;
      };

      Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc > 0){
          this.percentage = Math.round((this.values /totalInc)*100);
        }else{
          this.percentage = -1;
        }
      };

      Expense.prototype.getPercentage = function(){
        return this.percentage;
      }

  
  //Create one data object that will store all income and expense details
      var data = {
        allItems : {
          exp : [],
          inc: []
        },
        totals : {
          exp : 0,
          inc : 0
        },
        budget : 0,
        percentage : 0
      };

      //Calculate total expense and income and store values to data
      var calculateTotal = function(type){
          var sum =0;
          data.allItems[type].forEach(function(current){
            sum += current.values;
          });
          data.totals[type] = sum;
      }
  

      return{
        //method to add all item into the respective list
        addItem : function(type,desc,val){
          //calculate id of lastitem added and return updated id
          var newItem,id;
  
          if(data.allItems[type].length > 0){
            id = data.allItems[type][data.allItems[type].length-1].id + 1;
          }
          else {
              id=0;
          }
  
          //If the type is expense or income, add item here
          if(type === 'exp'){
            newItem = new Expense(id,desc,val);
          }else if(type === 'inc'){
            newItem = new Income(id,desc,val);
          }
          //push new item to the respective catogry list
          data.allItems[type].push(newItem);
          //return the new object for furthur calculation
          return newItem;
        },


        deleteItem : function(type,id){
          var ids,index;

          //create a map of id and index
          ids = data.allItems[type].map(function(current){
            return current.id;
          });

          index = ids.indexOf(id);

          if(index !== -1){
            data.allItems[type].splice(index,1);
          };
        },
  
        displayData : function(){
          console.log(data);
        },

        //Calculate budget,income,expense and percentage and store to data
        calculateBudget: function(){

            //calculate the total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget i.e income-expense
            data.budget = data.totals.inc - data.totals.exp; 

            //calculate percentage
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            else
            data.percentage = -1;
        },

        //return budget data to controller
        getBudget: function(){
            return {
                totalBudget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                totalPercentage: data.percentage
            }
        },

        calcPercentages : function(){
            data.allItems.exp.forEach(function(cur){
              cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function(){
          var allPerc = data.allItems.exp.map(function(cur){
            return cur.getPercentage();
          });
          return allPerc;
        }
      };
  
  
  
  })();




  //This is a UI module and this is handling UI interaction. This is an independent
  //module like budgetController
  
  var UIController = (function(){
  
      //Create a private object storing all html class so that if modification is required, it should not correct it at every place
      var DOMString = {
          inputType : '.add__type',
          inputDescription :'.add__description',
          inputValue :'.add__value',
          inputButton : '.add__btn',
          incomeContainer : '.income__list',
          expensesContainer : '.expenses__list',
          totalBudget : '.budget__value',
          totalIncome : '.budget__income--value',
          totalExpenses : '.budget__expenses--value',
          totalPercent : '.budget__expenses--percentage',
          container : '.container',
          itemPercLabel : '.item__percentage',
          dateLabel : '.budget__title--month'
      };

      var formatString = function(num,type){
         
         var numSplit,int,dec;
          num = Math.abs(num);
          num = num.toFixed(2);

          numSplit = num.split('.');
          
          int = numSplit[0];

          if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
          }
          dec = numSplit[1];

          return (type === 'exp'? '-':'+') + ' '+int + '.' + dec;
      };

      var nodeListForEach = function(list,callBack){
        for(var i=0; i< list.length; i++){
          callBack(list[i],i);
        }
    };


      return{
          //User defined values at UI are stored in an object and shared to controller
          getInput : function(){
              return{
                  type : document.querySelector(DOMString.inputType).value, //type will be "inc" and exp "only"
                  description : document.querySelector(DOMString.inputDescription).value,
                  value : parseFloat(document.querySelector(DOMString.inputValue).value)
              }
          },
          //Return copy of our DOMString object to controller with all tags
          getDOMString : function(){
              return DOMString;
          },


          //Whenever called, This method is going to update HTML page to UI with corrosponding entries.
          addListItem : function(obj,type){

            var html,newHtml,element;

            //If type recieved is inc, create an HTML page entry for Income in income list and instead of values to be displayed,currently place placeHolder that we will replace.
            if(type === 'inc'){
              element = DOMString.incomeContainer;
              html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%values%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //If type recieved is exp, create an HTML page entry for expenses in expenses list and instead of values to be displayed,currently place placeHolder that we will replace.
            if(type === 'exp'){
              element = DOMString.expensesContainer;
              html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %values%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace all the placeHolder with actual values
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%values%',formatString(obj.values,type));
  
            //Insert the html page at the end of  respective list .'beforeend' is function we are using for that
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
          },


          //This method is going to clear the input field.
          clearInput : function(){
                var field,fieldsArr;
                //Use querySelectorAll to store all values to be cleared from the UI
                fields = document.querySelectorAll(DOMString.inputDescription+ ','+DOMString.inputValue);
                
                //Use Array prototype, then use call method to borrow slice method from array prototype 
                fieldsArr = Array.prototype.slice.call(fields);
                //Use forEach method to iterate over fieldsArr
                fieldsArr.forEach(function(current,index,array){
                    current.value = "";
                });
                //set the focus back to description field
                fieldsArr[0].focus();
          },

          //Display Budget to UI
          displayBudget : function(obj){
              var type;
              type = obj.totalBudget < 0 ? 'exp':'inc';
            
              document.querySelector(DOMString.totalBudget).textContent = formatString(obj.totalBudget,type);
              document.querySelector(DOMString.totalIncome).textContent = formatString(obj.totalIncome,'inc');
              document.querySelector(DOMString.totalExpenses).textContent = formatString(obj.totalExpense,'exp');

              if(obj.totalPercentage > 0){
                document.querySelector(DOMString.totalPercent).textContent = obj.totalPercentage + '%';
              }
              else{
                document.querySelector(DOMString.totalPercent).textContent = '---'
              }
          },

          displayPercentage : function(percentages){

            var fields = document.querySelectorAll(DOMString.itemPercLabel);

            nodeListForEach(fields,function(curr,index){
                if(percentages[index] > 0){
                  curr.textContent = percentages[index] + '%';
                }
                else{
                  curr.textContent =  '---';
                }
            });
          },

          displayDate : function() {
            var now,month,months,year;
            now = new Date();

            months = ['January','Feburary','March','April','May','June','July','August','October','November','December'];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMString.dateLabel).textContent = months[month] + " " + year;
          },

          //Delete list item
          deleteListItem : function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
          },

          changedType : function(){
            var fields = document.querySelectorAll(
              DOMString.inputType + ',' +
              DOMString.inputDescription + ',' +
              DOMString.inputValue
            );

            nodeListForEach(fields,function(curr){
              curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.inputButton).classList.toggle('red');
          }
      }
  
  })();

  


  //This is a contoller Module that is interacting with data module and UI module.
  
  var controller= (function(budgetCtrl,UICtrl){
  //All events will be called from this area.
      var setUpEventListner = function(){
          var DOM = UICtrl.getDOMString();
          //If button is clicked or enter(keyCode of enter is 13) is pressed, control should go to ctrlAddItem
          document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
          document.addEventListener('keypress',function(event){
              if(event.keyCode === 13 || event.which === 13){
                  ctrlAddItem();
              }
          });

          document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

          document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
      };


      //This method is going to update budget everytime,item will be added to list
      var updateBudget = function(){
          var budget;
        //Calculate the budget
            budgetCtrl.calculateBudget();
        //return the updated budget to UI
            budget = budgetCtrl.getBudget();

        //Display the updated budget to UI
        UICtrl.displayBudget(budget);

      }

      var updatePercentage = function(){
        var arrPerc;
        // 1. Calcualte the budget
          budgetCtrl.calcPercentages();

        // 2. Update the percentege
          arrPerc = budgetCtrl.getPercentages();

        // 3. Display the percentage
        UICtrl.displayPercentage(arrPerc);

      }


      var ctrlAddItem = function(){
        var input,newItem;

              // Get data from the field
              input = UICtrl.getInput();

              //Check if input is right or not
              if(input.description !== "" && !isNaN(input.value) && input.value > 0){
                //Add the item to budget controller(data controller)
                newItem = budgetCtrl.addItem(input.type,input.description,input.value);

                //Add the item to UI
                UICtrl.addListItem(newItem,input.type);

                //Clear the fields after recieving the input
                UICtrl.clearInput();

                //calculate and update the budget.
                updateBudget();

                //Update the percentage in the UI
                updatePercentage();
            }
      }

      var ctrlDeleteItem = function(event){
        var itemID,splitID;
        itemID =event.target.parentNode.parentNode.parentNode.parentNode.id ;
        if(itemID){
          splitID = itemID.split('-');
          type = splitID[0];
          ID = parseInt(splitID[1]);
          
          // 1. Delete item from budget controller
            budgetCtrl.deleteItem(type,ID);

          // 2. Delete the corrosponding entry from UI
          UICtrl.deleteListItem(itemID);

          // 3. Update the budget
          updateBudget();

          //Update the percentage in the UI
          updatePercentage();


        }
      }

  
      return {
          init : function(){
              UICtrl.displayDate();
              UICtrl.displayBudget({
                totalBudget: 0,
                totalIncome: 0,
                totalExpense: 0,
                totalPercentage: 0
              });
              setUpEventListner();
          }
      }
  })(budgetController,UIController);
  
  controller.init();
  