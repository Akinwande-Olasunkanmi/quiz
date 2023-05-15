const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const quizTime = document.getElementById('quizTime');




let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

fetch(
    "https://opentdb.com/api.php?amount=20&category=9&difficulty=easy&type=multiple"
)
    .then(res => {
        return res.json();
    })
    .then(loadedQuestions => {
        console.log(loadedQuestions.results);
        questions = loadedQuestions.results.map( loadedQuestion => {
            const formattedQuestion = {
                question: loadedQuestion.question
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 3) +1;
            answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestion.correct_answer);

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            })

            return formattedQuestion;
        });
   
        startGame();
    })
    .catch( err => {
        console.error(err);
    });

// constants
const CORRECT_BONUS = 5;
const MAX_QUESTIONS = 20;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');

    

    var total_seconds = 60 * 5;
    var c_minutes = parseInt(total_seconds / 60);
    var c_seconds = parseInt(total_seconds % 60);

   
    function checkTime(score){
        document.getElementById('quizTime').innerHTML = 'Time Left : ' + c_minutes + ' minutes ' + c_seconds + ' seconds';
        if(total_seconds <= 0 ){

            return window.location.assign('/end.html');
            
        } else {
            total_seconds = total_seconds -1;
            c_minutes = parseInt(total_seconds / 60);
            c_seconds = parseInt(total_seconds % 60);

            setTimeout( () =>{
                checkTime(score);
            }, 1000);
        };
    };
    setTimeout( () => {
        checkTime();
    }, 1000);
    console.log(checkTime());

};

getNewQuestion = () => {
    if(availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS){
        localStorage.setItem('mostRecentScore', score);
        // go to the end page
        return window.location.assign('/end.html');
    }
    questionCounter++;

    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

    // update progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    })

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if(!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        if(classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout( () =>{
            selectedChoice.parentElement.classList.remove(classToApply);

            getNewQuestion();
        }, 1000);
       

    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
}





