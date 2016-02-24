angular.module('myApp.services').service('toolBelt', [

	function() {
		this.makeDates = function(start, fin) {
			var date = {};
			var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var d = new Date(start);
			if (d) {
				date.startY = d.getFullYear();
				date.startM = monthNames[d.getMonth()];
				date.startD = d.getDate();
				date.startT = formatAMPM(d);
				var f = new Date(fin);
				if (f) {
					date.finY = f.getFullYear();
					date.finM = monthNames[f.getMonth()];
					date.finD = f.getDate();
					date.finT = formatAMPM(f);
				}
				return date;
			} else {
				return false;
			}

			function formatAMPM(D) {
				var hours = D.getHours();
				var minutes = D.getMinutes();
				var ampm = hours >= 12 ? 'pm' : 'am';
				hours = hours % 12;
				hours = hours ? hours : 12; // the hour '0' should be '12'
				minutes = minutes < 10 ? '0' + minutes : minutes;
				var strTime = hours + ':' + minutes + ' ' + ampm;
				return strTime;
			}
		}
		this.sortData = function(data, type, direction) {
			console.log("Sorting Data for" + type + "!");
			return data.sort(sortFunct);

			function sortFunct(a, b) {
				var numberTypes = ['FolderCount', 'MessageCount', 'EmailCount', 'CalendarCount', 'TaskCount', 'OtherCount', 'JobId', 'BatchId', 'ItemsTotal', 'ItemsRemaining', 'ItemsFailed', 'Size', 'progress'];
				var stringTypes = ['JobStatus', 'SourceMailbox', 'TargetMailbox', 'Subject', 'Folder', 'MessageClass', 'StatusMessage', 'ItemStatus', 'Path', 'Owner1'];
				if (numberTypes.indexOf(type) !== -1) {
					return direction * (a[type] - b[type]);
				} else if (stringTypes.indexOf(type) !== -1) {
					if (!a[type]) {
						return 1;
					} else if (!b[type]) {
						return -1;
					} else {
						return a[type].localeCompare(b[type]) * direction;
					}
				} else if (type === 'DiscoveryDate') {
					if (a.DiscoveryDate > b.DiscoveryDate) {
						return direction * 1;
					} else if (a.DiscoveryDate < b.DiscoveryDate) {
						return direction * -1;
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			} // End sortFunct
		}
	}
]);