<script>
	const cardColors = [
		"red",
		"orange",
		"yellow",
		"green",
		"teal",
		"blue",
		"indigo",
		"purple",
		"pink",
	]

	let defaultColor = "blue"

	/**
	* @method: guid
	* @desc: Generates unique guid
	**/
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

	let notesColumns = [
		[]
	]

	function addNote(index) {
		return () => {
			const id = guid()
			notesColumns[index][notesColumns[index].length] = {
				id,
				color: defaultColor,
				title: "Note Title Here",
				content: `Note Content Here ${id}`,
			}
		}
	}

	function addNoteColumn() {
		notesColumns[notesColumns.length] = []
	}

	let dragging = {
		id: '',
		status: false,
		currentCol: 0,
		order: null,
		target: null,
	}

	let startDrag = (
		id,
		currentCol
	) => ev =>  {
		dragging = {
			id,
			currentCol,
			status: true,
			target: ev.target,
			order: ev.target.dataset.index
		}

		ev.dataTransfer.effectAllowed = "move"
	}

	let handleDrop = index => ev => {
		ev.preventDefault()

		const finalIndex = dragging.order || notesColumns[index].length
		
		const note = notesColumns[dragging.currentCol].find((n) => n.id === dragging.id)

		notesColumns[dragging.currentCol].splice(notesColumns[dragging.currentCol].indexOf(note), 1)
		notesColumns[index].splice(finalIndex, 0, note)

		notesColumns = notesColumns
	}

	let handleDragOver = ev => {
		if (ev.preventDefault) {
			ev.preventDefault(); // Necessary. Allows us to drop.
		}

		if (ev.target.dataset.droppable != "true")
			ev.dataTransfer.dropEffect = "none"; // dropping is not allowed
		else
			ev.dataTransfer.dropEffect = "move"; // drop it like it's hot

		if (ev.target.id) {
			dragging.order = ev.target.dataset.index
		}
	}
</script>

<style>
</style>

<div class="h-screen">
	<nav class="flex items-center justify-between bg-teal p-6">
		<div class="flex items-center flex-no-shrink text-white mr-6">
			<span class="font-semibold text-xl tracking-tight">Sticky Note POC</span>
		</div>
		<div class="block lg:hidden">
			<button class="flex items-center px-3 py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white">
			<svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
			</button>
		</div>
	</nav>


	<section class="flex items-stretch min-h-full" style="overflow-x: scroll;">
		{#each notesColumns as noteColumn, index}
			<div class="flex-no-shrink m-3" style="width: 320px;" on:dragover={handleDragOver} on:drop={handleDrop(index)} data-droppable="true">
				<button on:click={addNote(index)} class="w-full font-bold text-xl text-grey">
					+
				</button>
				{#each noteColumn as note, i (note.id)}
					<div class="max-w-xs rounded shadow bg-{note.color}-lightest border border-{note.color}-lighter mt-5" data-index="{i}" id="{note.id}" on:dragover={handleDragOver} draggable on:dragstart={startDrag(note.id, index)}>
						<div class="px-6 py-4">
							<div class="font-bold text-xl mb-2">
								{note.title}
							</div>
							<p class="text-grey-darker text-base">
								{note.content}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/each}
		<div class="m-3 bg-grey-lightest w-24 self-stretch">
			<button on:click={addNoteColumn} class="w-full  h-full font-bold text-xl">
				<svg class="fill-current text-grey" width="48" height="48" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M845 1395l454-454q19-19 19-45t-19-45l-454-454q-19-19-45-19t-45 19l-102 102q-19 19-19 45t19 45l307 307-307 307q-19 19-19 45t19 45l102 102q19 19 45 19t45-19zm819-499q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"/></svg>
			</button>
		</div>
	</section>
</div>
