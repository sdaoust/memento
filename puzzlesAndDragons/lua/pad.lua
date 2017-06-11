require 'luarocks.require'
http = require 'socket.http'

function parseMonster(number)
	
	html = http.request('http://puzzledragonx.com/en/monster.asp?n='..number)

	monster = string.match(html, '<title>([^|]+) stats, skills, evolution, location')

	primaryElement = getElement(string.match(html, 'e1=(%d)&e2=%d&o1='))

	secondaryElementNumber = string.match(html, ' / [^?]+\?e1=(%d)&e2=%d&o1=')
	secondaryElement = getElement(secondaryElementNumber)

	skill = string.match(html, '<span class="blue">([^<]+)')
	if skill == 'None' then skill = '' end
	
	nextEvoMonsters = ''
	evoType = getMonsterEvoType(number)
	nextEvoNumber, nextEvoName, nextEvoType = getNextEvoMonster(number)
	-- if this monster is regular, look for the next evo monster
	if evoType == 'regular' then
		nextEvoMonsters = '"'..nextEvoName..'"'
		-- if the next evo monster is an ultimate monster, look for all ultimate monsters
		if nextEvoType == 'ultimate' then
			while nextEvoNumber do
				nextEvoNumber, nextEvoName, nextEvoType = getNextEvoMonster(nextEvoNumber)
				if nextEvoType == 'ultimate' then
					nextEvoMonsters = nextEvoMonsters..', "'..nextEvoName..'"'
				end
			end
		end
	-- if this monster is an ultimate monster, look for its reincarnated form
	elseif evoType == 'ultimate' and nextEvoType == 'reincarnated' then
		nextEvoMonsters = '"'..nextEvoName..'"'
	-- if this monster is a reincarnated monster, do nothing
	end

	-- name	number	primaryelement	secondaryelement	skill	nextevomonsters
	io.write(
		monster..'\t'..
		number..'\t'..
		primaryElement..'\t'..
		secondaryElement..'\t'..
		skill..'\t'..
		nextEvoMonsters..'\t'..
		'\r\n'
	)
end

function getElement(number)
	local element = ''
	if     number == '1' then element = 'Fire'
	elseif number == '2' then element =  'Water'
	elseif number == '3' then element =  'Wood'
	elseif number == '4' then element =  'Light'
	elseif number == '5' then element =  'Dark'
	end
	return element
end

function getMonsterEvoType(number)
	local evoType = 'regular';
	if string.match(html, 'awokenevolve"><div class="evolveframe[^N]+No.'..number..' ([^"]+)') then
		evoType = 'reincarnated'
	elseif string.match(html,  'finalevolve.-evolveframe[^N]+No.'..number..' ([^"]+)') then
		evoType = 'ultimate'
	end
	return evoType
end

function getNextEvoMonster(number)
	local nextEvoNumber, nextEvoName = string.match(html, 'evolveframe[^N]+No.'..number..' .-evolveframe[^N]+No.(%d+) ([^"]+)')
	local nextEvoType = nil
	if nextEvoNumber then 
		nextEvoType = getMonsterEvoType(nextEvoNumber)
	end
	return nextEvoNumber, nextEvoName, nextEvoType
end

file = io.open('pad.txt', 'w+')
lastNumber = 5
for i=1,5 do
	io.output(io.stdout)
	io.write('\r'..i..'/'..lastNumber)
	io.flush()
	io.output(file)
	parseMonster(i)
end
io.close(file)
io.output(io.stdout)
io.write('\n')