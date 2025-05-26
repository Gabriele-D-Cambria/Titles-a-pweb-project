
export class Timer{
	constructor(funzioneDaChiamare, timer){
		this.timerIntervall = setInterval(() => {
			this.updateTimer(funzioneDaChiamare);
		}, timer);
	}
	

	updateTimer(funzioneDaChiamare){
		const span = document.getElementById("timer");
		if (span === null){
			if (this.timerIntervall !== null){
				clearInterval(this.timerIntervall);
				this.timerIntervall = null;
			}
			return;
		}
		let [minutes, seconds] = span.innerText.split(":").map(Number);
		if(minutes < 0 || seconds < 0){
			this.clearTimer();
			minutes = 0;
			seconds = 0;
		}
		else if(minutes === 0 && seconds === 0){
			clearInterval(this.timerIntervall);
			funzioneDaChiamare();
			return;
		} 
		else {
			if (seconds === 0){
				--minutes;
				seconds = 59;
			} else {
				--seconds;
			}
		}
		span.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	clearTimer(){
		if(this.gameTimer !== null){
			clearInterval(this.timerIntervall);	
			this.gameTimer = null;	
		}

		return this;

	}
}