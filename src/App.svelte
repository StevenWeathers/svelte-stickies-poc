<script>
	import guid from './generateGuid.js'

	import NavMenu from './components/NavMenu.svelte'
	import TimesIcon from './components/TimesIcon.svelte'
	import DropperIcon from './components/DropperIcon.svelte'

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

	const defaultColor = "blue"

	// All the Stateful things...
	let notesColumns = [
		{
			id: guid(),
			notes: []
		}
	]

	let changeColor = ''

	let dragging = {
		id: '',
		status: false,
		currentCol: 0,
		order: null,
		target: null,
	}

	// event handlers
	const addNote = (index) => () => {
		const id = guid()
		
		notesColumns[index].notes[notesColumns[index].notes.length] = {
			id,
			color: defaultColor,
			title: "Note Title Here",
			content: `Note Content Here ${id}`,
		}
	}

	const deleteNote = (column, index) => () => {
		notesColumns[column].notes.splice(notesColumns[column].notes[index], 1)
		notesColumns = notesColumns
	}

	const addNoteColumn = () => notesColumns[notesColumns.length] = {
		id: guid(),
		notes: [],
	}

	const showChangeColor = id => () => changeColor = id

	const changeNoteColor = (column, index, color) => () => {
		notesColumns[column].notes[index].color = color
		changeColor = ''
	}

	const noteContentEdit = (column, index, type) => event => {
		notesColumns[column].notes[index][type] = event.target.value
	}

	const startDrag = (
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

	const handleDrop = index => ev => {
		ev.preventDefault()

		const finalIndex = dragging.order || notesColumns[index].notes.length
		
		const note = notesColumns[dragging.currentCol].notes.find((n) => n.id === dragging.id)

		notesColumns[dragging.currentCol].notes.splice(notesColumns[dragging.currentCol].notes.indexOf(note), 1)
		notesColumns[index].notes.splice(finalIndex, 0, note)

		notesColumns = notesColumns
	}

	const handleDragOver = ev => {
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
	<NavMenu />

	<section class="flex items-stretch min-h-full" style="overflow-x: scroll;">
		{#each notesColumns as noteColumn, index}
			<div class="flex-no-shrink m-3" style="width: 320px;" on:dragover={handleDragOver} on:drop={handleDrop(index)} data-droppable="true">
				<button on:click={addNote(index)} class="w-full font-bold text-3xl text-grey bg-grey-lightest p-1">
					+
				</button>
				{#each noteColumn.notes as note, i (note.id)}
					<div class="max-w-xs shadow bg-{note.color}-lightest border border-{note.color}-lighter mt-5" data-index="{i}" id="{note.id}" on:dragover={handleDragOver} draggable on:dragstart={startDrag(note.id, index)}>
						<div class="p-3">
							<div class="mb-2 relative flex mb-4">
								<div class="w-1/4">
									<button class="float-left" on:click={deleteNote(index, i)}>
										<TimesIcon color={note.color} />
									</button>
								</div>
								<div class="w-2/4">
									<input type="text" value="{note.title}" on:change={noteContentEdit(index, i, "title")} class="inline font-bold text-xl bg-transparent" />
								</div>
								<div class="w-1/4 text-right">
									<button on:click={showChangeColor(note.id)}>
										<DropperIcon color={note.color} />
									</button>
									{#if changeColor === note.id}
										<div class="shadow border bg-white absolute pin-r">
											{#each cardColors as color}
												<button on:click={changeNoteColor(index, i, color)} class="p-3 hover:bg-{color}-lighter bg-{color}-lightest">&nbsp;</button>
											{/each}
										</div>
									{/if}
								</div>
							</div>
							<textarea class="w-full h-full bg-transparent" rows="5" on:change={noteContentEdit(index, i, "content")}>{note.content}</textarea>
						</div>
					</div>
				{/each}
			</div>
		{/each}
		<div class="m-3 bg-grey-lightest w-16 self-stretch flex-no-shrink">
			<button on:click={addNoteColumn} class="w-full h-full font-bold text-5xl text-grey">
				+
			</button>
		</div>
	</section>
</div>
