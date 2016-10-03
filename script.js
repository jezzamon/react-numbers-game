//calculate through all possible combinations in array and loop over them checking their sum and checking against their value of the stars
var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

var StarsFrame = React.createClass({
  render: function() {
    var stars = [];
    for (var i =0; i < this.props.numberOfStars; i++) {
      stars.push(
        <span className="glyphicon glyphicon-star"></span>
      );
    }

    return (
      <div id="stars-frame">
        <div className="well">
          {stars}
        </div>
      </div>
    );
  }
});

var ButtonFrame = React.createClass({
  render: function() {
    var disabled, button, correct = this.props.correct;
      /*****************************************************/
      //use a switch statement for correct variable
        //depending on correct variable button will be styled differently before rendering
            //if answer is correct, button will have accept Answer method from Game component
    switch(correct) {
      case true:
        button = (
          <button className="btn btn-success btn-lg"
                  onClick={this.props.acceptAnswer}>
            <span className="glyphicon glyphicon-ok"></span>
          </button>
        );
        break;
      case false:
        button = (
          <button className="btn btn-danger btn-lg">
            <span className="glyphicon glyphicon-remove"></span>
          </button>
        );
        break;
      default:
        disabled = (this.props.selectedNumbers.length === 0);
        button = (
          <button className="btn btn-primary btn-lg" disabled={disabled}
                  onClick={this.props.checkAnswer}>
            =
          </button>
        );
    }
      //add a refresh button, onClick run redraw function passed down from Game component
        //include number of redraws allowed from redraws passed down from Game component
            //make button disable if redraws is 0
    return (
      <div id="button-frame">
        {button}
        <br /><br />
        <button className="btn btn-warning btn-xs" onClick={this.props.redraw}
                disabled={this.props.redraws === 0}>
          <span className="glyphicon glyphicon-refresh"></span>
          &nbsp;
          {this.props.redraws}
        </button>
      </div>
    );
  }
});

var AnswerFrame = React.createClass({
  render: function() {
    var props = this.props;
    var selectedNumbers = props.selectedNumbers.map(function(i) {
      return (
        <span onClick={props.unselectNumber.bind(null, i)}>
          {i}
        </span>
      )
    });

    return (
      <div id="answer-frame">
        <div className="well">
          {selectedNumbers}
        </div>
      </div>
    );
  }
});

var NumbersFrame = React.createClass({
  render: function() {
      
      //add a new class usedNumbers to style usedNumbers as green, using usedNumbers prop info
    var numbers = [], className,
        selectNumber = this.props.selectNumber,
        usedNumbers = this.props.usedNumbers,
        selectedNumbers = this.props.selectedNumbers;
      
      //className for each element will vary depending on info
    for (var i=1; i <= 9; i++) {
      className = "number selected-" + (selectedNumbers.indexOf(i)>=0);
      className += " used-" + (usedNumbers.indexOf(i)>=0);
      numbers.push(
        <div className={className} onClick={selectNumber.bind(null, i)}>
          {i}
        </div>
      );
    }
    return (
      <div id="numbers-frame">
        <div className="well">
          {numbers}
        </div>
      </div>
    );
  }
});

var DoneFrame = React.createClass({
  render: function() {
    return (
      <div className="well text-center">
        <h2>{this.props.doneStatus}</h2>
        <button className="btn btn-default"
                onClick={this.props.resetGame}>
          Play again
        </button>
      </div>
    );
  }
});

var Game = React.createClass({
  getInitialState: function() {
    return { numberOfStars: this.randomNumber(),
             selectedNumbers: [],
             usedNumbers: [],
             redraws: 5,
             correct: null,
             doneStatus: null };
  },
  resetGame: function() {
    this.replaceState(this.getInitialState());
  },
  randomNumber: function() {
    return Math.floor(Math.random()*9) + 1
  },
  selectNumber: function(clickedNumber) {
    if (this.state.selectedNumbers.indexOf(clickedNumber) < 0) {
      this.setState(
        { selectedNumbers: this.state.selectedNumbers.concat(clickedNumber),
          correct: null } //select correct to null to always reset correct value on click
      );
    }
  },
  unselectNumber: function(clickedNumber) {
    var selectedNumbers = this.state.selectedNumbers,
        indexOfNumber = selectedNumbers.indexOf(clickedNumber);

    selectedNumbers.splice(indexOfNumber, 1);

    this.setState({ selectedNumbers: selectedNumbers, correct: null }); //select correct to null
  },
    /****************************************************************/
    //sum selectedNumbers array using reduce function, starting at 0
  sumOfSelectedNumbers: function() {
    return this.state.selectedNumbers.reduce(function(p,n) {
      return p+n;
    }, 0)
  },
    /*****************************************************************/
    //set a checkAnswer to return true or false for correct state
  checkAnswer: function() {
    var correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
    this.setState({ correct: correct });
  },
    //run this when answer is correct
  acceptAnswer: function() {
    
    //change used numbers and add to them the currently selected numbers
    var usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
    //update the state
      //reset selectedNumbers to empty
        //set the new usedNumbers
        //at this point game is ready for new random number of stars
        //function at end is used as callback once its done, as setState is an async function
    this.setState({
      selectedNumbers: [],
      usedNumbers: usedNumbers,
      correct: null,
      numberOfStars: this.randomNumber()
    }, function() {
      this.updateDoneStatus();
    });
  },
    //the redraw function here, randomize amount of stars
        //only run if redraw is above 0, otherwise stay at 0
        //reset the correct and selected numbers field
        //each time redraw is run, -1 from redraws state
        
  redraw: function() {
    if (this.state.redraws > 0) {
      this.setState({
        numberOfStars: this.randomNumber(),
        correct: null,
        selectedNumbers: [],
        redraws: this.state.redraws - 1
      }, function() {
        this.updateDoneStatus();
      });
    }
  },
  possibleSolution: function() {
    var numberOfStars = this.state.numberOfStars,
        possibleNumbers = [],
        usedNumbers = this.state.usedNumbers;
    //easiest way to find possible solution is loop through 1 to 9 and exclude used numbers only
        //pushing everthing else in possible numbers array
    for (var i=1; i<=9; i++) {
      if (usedNumbers.indexOf(i) < 0) {
        possibleNumbers.push(i);
      }
    }
      //possiblenumbers is available numbers, check with number of stars, algorithm is on line 1 to check all combinations
    return possibleCombinationSum(possibleNumbers, numberOfStars);
  },
    //two conditions : 1 for succesful run and for game over 
        //if we have exactly 9 used numbers, user wins
            //setState for doneStatus
  updateDoneStatus: function() {
    if (this.state.usedNumbers.length === 9) {
      this.setState({ doneStatus: 'Done. Nice!' });
      return;
    }  //
    if (this.state.redraws === 0 && !this.possibleSolution()) {
      this.setState({ doneStatus: 'Game Over!' });
    }
  },
  render: function() {
    var selectedNumbers = this.state.selectedNumbers,
        usedNumbers = this.state.usedNumbers,
        numberOfStars = this.state.numberOfStars,
        redraws = this.state.redraws,
        correct = this.state.correct,
        doneStatus = this.state.doneStatus,
        bottomFrame;
      //if doneStatus state is no longer null and been changed to string,  is finished used DoneFrame element, if not use Numbersframe component
    if (doneStatus) {
      bottomFrame = <DoneFrame doneStatus={doneStatus}
                               resetGame={this.resetGame} />;
    } else {
      bottomFrame = <NumbersFrame selectedNumbers={selectedNumbers}
                      usedNumbers={usedNumbers}
                      selectNumber={this.selectNumber} />;
    }

    return (
      <div id="game">
        <h2>Play Nine</h2>
        <hr />
        <div className="clearfix">
          <StarsFrame numberOfStars={numberOfStars} />
          <ButtonFrame selectedNumbers={selectedNumbers}
                       correct={correct}
                       redraws={redraws}
                       checkAnswer={this.checkAnswer}
                       acceptAnswer={this.acceptAnswer}
                       redraw={this.redraw} />
          <AnswerFrame selectedNumbers={selectedNumbers}
                       unselectNumber={this.unselectNumber} />
        </div>
        
        {bottomFrame}

      </div>
    );
  }
});

ReactDOM.render(
  <Game />,
  document.getElementById('container')
);

/*NOTES : Verifying answer - added the checkAnswer and sumOfselected answer methods on Game component
        Accepting answer - added acceptAnswer methods and on set passed props to Button component
        Redraws*/