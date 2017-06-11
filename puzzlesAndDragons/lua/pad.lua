require 'luarocks.require'
http = require 'socket.http'

function parseMonster(number)
	
	html = getHtml(number)

	if not isMonsterEnglish(html) then
		return
	end

	monster = string.match(html, '<title>([^|]+) stats, skills, evolution, location')

	primaryElement = getMonsterElement(string.match(html, 'e1=(%d)&e2=%d&o1='))

	secondaryElementNumber = string.match(html, ' / [^?]+\?e1=(%d)&e2=%d&o1=')
	secondaryElement = getMonsterElement(secondaryElementNumber)

	skill = string.match(html, '<span class="blue">([^<]+)')
	if skill == 'None' 
		then skill = '' 
	end

	nextEvoMonsters = ''
	evoType = getMonsterEvoType(number)
	nextEvoNumber, nextEvoName, nextEvoType = getNextEvoMonster(number)
	if nextEvoNumber then 
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

function getHtml(number)
	return http.request('http://puzzledragonx.com/en/monster.asp?n='..number)
end

function getMonsterElement(number)
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
		--confirm next monster is english
		if isMonsterEnglish(getHtml(nextEvoNumber)) then
			nextEvoType = getMonsterEvoType(nextEvoNumber)
		else
			--this monster isn't english, so let's try the next one
			return getNextEvoMonster(nextEvoNumber)
		end
	end
	return nextEvoNumber, nextEvoName, nextEvoType
end

function isMonsterEnglish(html)
	return string.find(html, 'This card is not yet available in the English version of PAD') == nil
end

monsterFile = io.open('monsters.txt', 'w+')
io.output(monsterFile)
io.write('Name\tNumber\tPrimary Element\tSecondary Element\tSkill\tNext Evo Monsters\r\n')
firstMonsterNumber = 2561
lastMonsterNumber  = 2561
for i=firstMonsterNumber,lastMonsterNumber do
	io.output(io.stdout)
	io.write('\r'..i..'/'..lastMonsterNumber)
	io.flush()
	io.output(monsterFile)
	parseMonster(i)
end
io.close(monsterFile)
io.output(io.stdout)
io.write('\n')